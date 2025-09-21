package io.github.sssamira.legalsheba.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.sssamira.legalsheba.model.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}
