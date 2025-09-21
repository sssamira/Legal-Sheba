package io.github.sssamira.legalsheba.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.sssamira.legalsheba.model.LawyerProfile;
import io.github.sssamira.legalsheba.model.UserEntity;

public interface LawyerProfileRepository extends JpaRepository<LawyerProfile, Long> {
    Optional<LawyerProfile> findByUser(UserEntity user);
    boolean existsByUser(UserEntity user);
    Optional<LawyerProfile> findByUserId(Long userId);
}
