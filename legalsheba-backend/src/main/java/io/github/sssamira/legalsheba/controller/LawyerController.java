package io.github.sssamira.legalsheba.controller;

import io.github.sssamira.legalsheba.model.LawyerProfile;
import io.github.sssamira.legalsheba.model.Specialty;
import io.github.sssamira.legalsheba.repository.LawyerProfileRepository;
import io.github.sssamira.legalsheba.repository.SpecialtyRepository;
import io.github.sssamira.legalsheba.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lawyers")
@RequiredArgsConstructor
public class LawyerController {

    private final LawyerProfileRepository lawyerProfileRepository;
    private final SpecialtyRepository specialtyRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<LawyerDto> list() {
        return lawyerProfileRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LawyerDto> get(@PathVariable Long id) {
        return lawyerProfileRepository.findById(id)
                .map(lp -> ResponseEntity.ok(toDto(lp)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Utility: get lawyer profile id by userId (for bridging logic)
    @GetMapping("/by-user/{userId}/profile-id")
    public ResponseEntity<Long> getProfileIdByUser(@PathVariable Long userId) {
        return lawyerProfileRepository.findByUserId(userId)
                .map(lp -> ResponseEntity.ok(lp.getId()))
                .orElse(ResponseEntity.notFound().build());
    }

    // Utility: get current authenticated lawyer's profile id
    @GetMapping("/me/profile-id")
    public ResponseEntity<Long> getMyProfileId(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return userRepository.findByEmail(principal.getUsername())
                .flatMap(u -> lawyerProfileRepository.findByUserId(u.getId()))
                .map(lp -> ResponseEntity.ok(lp.getId()))
                .orElse(ResponseEntity.notFound().build());
    }

    private LawyerDto toDto(LawyerProfile lp) {
        List<String> specs = specialtyRepository.findByLawyer(lp).stream()
                .map(Specialty::getName)
                .collect(Collectors.toList());
        return LawyerDto.builder()
                .id(lp.getId())
                .name(lp.getUser() != null ? lp.getUser().getFName() : null)
                .experience(lp.getExperience())
                .location(lp.getLocation())
                .courtOfPractice(lp.getCourtOfPractice())
                .availabilityDetails(lp.getAvailabilityDetails())
                .vHour(lp.getVHour())
                .specialties(specs)
                .build();
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class LawyerDto {
        private Long id;
        private String name;
        private Integer experience;
        private String location;
        private String courtOfPractice;
        private String availabilityDetails;
        private String vHour;
        private List<String> specialties;
    }
}
