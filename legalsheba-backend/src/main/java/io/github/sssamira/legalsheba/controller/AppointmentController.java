package io.github.sssamira.legalsheba.controller;

import io.github.sssamira.legalsheba.model.Appointment;
import io.github.sssamira.legalsheba.model.LawyerProfile;
import io.github.sssamira.legalsheba.model.UserEntity;
import io.github.sssamira.legalsheba.repository.AppointmentRepository;
import io.github.sssamira.legalsheba.repository.LawyerProfileRepository;
import io.github.sssamira.legalsheba.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final LawyerProfileRepository lawyerProfileRepository;

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal User principal, @Valid @RequestBody CreateAppointmentRequest req) {
        if (principal == null) return ResponseEntity.status(401).build();
        Optional<UserEntity> clientOpt = userRepository.findByEmail(principal.getUsername());
        if (clientOpt.isEmpty()) return ResponseEntity.status(401).build();

        LawyerProfile lawyer = lawyerProfileRepository.findById(req.getLawyerProfileId()).orElse(null);
        if (lawyer == null) return ResponseEntity.badRequest().body("Invalid lawyerProfileId");

        Appointment appt = Appointment.builder()
                .client(clientOpt.get())
                .lawyer(lawyer)
                .appointmentDate(req.getAppointmentDate())
                .status("PENDING")
                .problemDescription(req.getProblemDescription())
                .notes(req.getNotes())
                .build();
        appt = appointmentRepository.save(appt);
        return ResponseEntity.ok(appt);
    }

    @GetMapping("/by-lawyer/{lawyerProfileId}")
    public ResponseEntity<?> listByLawyer(
        @PathVariable Long lawyerProfileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User principal
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        Optional<UserEntity> userOpt = userRepository.findByEmail(principal.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

    // First, treat the provided id as a userId to resolve the lawyer's profile; if not found, treat it as a profileId
    LawyerProfile lp = lawyerProfileRepository.findByUserId(lawyerProfileId)
        .or(() -> lawyerProfileRepository.findById(lawyerProfileId))
        .orElse(null);
    if (lp == null) return ResponseEntity.notFound().build();

        // Enforce that the authenticated user owns this lawyer profile
        if (lp.getUser() == null || !lp.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100)));
        Page<Appointment> p = appointmentRepository.findByLawyerOrderByIdDesc(lp, pageable);
        Page<AppointmentDto> dtoPage = p.map(this::toDto);
        return ResponseEntity.ok(PagedResponse.of(dtoPage));
    }

    // List appointments for the authenticated client (paginated)
    @GetMapping("/my")
    public ResponseEntity<?> listMyAppointments(
            @AuthenticationPrincipal User principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        Optional<UserEntity> userOpt = userRepository.findByEmail(principal.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100)));
        Page<Appointment> p = appointmentRepository.findByClientOrderByIdDesc(userOpt.get(), pageable);
        Page<AppointmentDto> dtoPage = p.map(this::toDto);
        return ResponseEntity.ok(PagedResponse.of(dtoPage));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest req, @AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        Optional<UserEntity> userOpt = userRepository.findByEmail(principal.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        return appointmentRepository.findById(id)
                .map(a -> {
                    // Ensure the principal is the owner of this lawyer profile
                    if (a.getLawyer() == null || a.getLawyer().getUser() == null || !a.getLawyer().getUser().getId().equals(userOpt.get().getId())) {
                        return ResponseEntity.status(403).body("Forbidden");
                    }
                    String newStatus = req.getStatus();
                    if (newStatus == null || newStatus.isBlank()) newStatus = a.getStatus();
                    // Basic status whitelist
                    switch (newStatus) {
                        case "PENDING":
                        case "CONFIRMED":
                        case "IN_PROGRESS":
                        case "COMPLETED":
                        case "REJECTED":
                            a.setStatus(newStatus);
                            appointmentRepository.save(a);
                            return ResponseEntity.ok(toDto(a));
                        default:
                            return ResponseEntity.badRequest().body("Invalid status");
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class CreateAppointmentRequest {
        private Long lawyerProfileId;
        private String appointmentDate;
        private String problemDescription;
        private String notes;
    }

    @Data
    public static class UpdateStatusRequest {
        private String status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class AppointmentDto {
        private Long id;
        private String appointmentDate;
        private String status;
        private String problemDescription;
        private String notes;
        private String clientName;
        private String lawyerName;
    }

    private AppointmentDto toDto(Appointment a) {
        String clientName = a.getClient() != null ? a.getClient().getFName() : null;
        String lawyerName = (a.getLawyer() != null && a.getLawyer().getUser() != null)
                ? a.getLawyer().getUser().getFName()
                : null;
        return AppointmentDto.builder()
                .id(a.getId())
                .appointmentDate(a.getAppointmentDate())
                .status(a.getStatus())
                .problemDescription(a.getProblemDescription())
                .notes(a.getNotes())
                .clientName(clientName)
                .lawyerName(lawyerName)
                .build();
    }

    @Data
    @AllArgsConstructor(staticName = "of")
    public static class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;

        public static <T> PagedResponse<T> of(Page<T> p) {
            return new PagedResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        }
    }
}
