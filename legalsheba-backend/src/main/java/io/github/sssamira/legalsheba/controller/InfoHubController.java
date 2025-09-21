package io.github.sssamira.legalsheba.controller;

import io.github.sssamira.legalsheba.model.InfoHub;
import io.github.sssamira.legalsheba.repository.InfoHubRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/infohub")
@RequiredArgsConstructor
public class InfoHubController {

    private final InfoHubRepository infoHubRepository;

    // List with optional category filter, pagination
    @GetMapping
    public ResponseEntity<PagedResponse<InfoHub>> list(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100)));
        Page<InfoHub> p = (category == null || category.isBlank())
                ? infoHubRepository.findAllByOrderByIdDesc(pageable)
                : infoHubRepository.findByCategoryIgnoreCaseOrderByIdDesc(category, pageable);
        return ResponseEntity.ok(PagedResponse.of(p));
    }

    // Get one
    @GetMapping("/{id}")
    public ResponseEntity<InfoHub> get(@PathVariable Long id) {
        return infoHubRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create (protected)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InfoHub> create(@Valid @RequestBody InfoHubRequest req) {
        InfoHub entity = InfoHub.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .category(req.getCategory())
                .date(req.getDate())
                .build();
        return ResponseEntity.ok(infoHubRepository.save(entity));
    }

    // Update (protected)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InfoHub> update(@PathVariable Long id, @Valid @RequestBody InfoHubRequest req) {
        return infoHubRepository.findById(id)
                .map(e -> {
                    e.setTitle(req.getTitle());
                    e.setContent(req.getContent());
                    e.setCategory(req.getCategory());
                    e.setDate(req.getDate());
                    return ResponseEntity.ok(infoHubRepository.save(e));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete (protected)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return infoHubRepository.findById(id)
                .map(e -> {
                    infoHubRepository.delete(e);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class InfoHubRequest {
        private String title;
        private String content;
        private String category;
        private String date; // keep as string (YYYY-MM-DD or similar)
    }

    @Data
    @Builder
    @AllArgsConstructor
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
