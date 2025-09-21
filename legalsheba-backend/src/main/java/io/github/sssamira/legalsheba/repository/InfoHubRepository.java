package io.github.sssamira.legalsheba.repository;

import io.github.sssamira.legalsheba.model.InfoHub;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InfoHubRepository extends JpaRepository<InfoHub, Long> {
    Page<InfoHub> findByCategoryIgnoreCaseOrderByIdDesc(String category, Pageable pageable);
    Page<InfoHub> findAllByOrderByIdDesc(Pageable pageable);
}
