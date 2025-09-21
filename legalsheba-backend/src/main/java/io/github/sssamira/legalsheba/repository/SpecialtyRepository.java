package io.github.sssamira.legalsheba.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.sssamira.legalsheba.model.Specialty;
import io.github.sssamira.legalsheba.model.LawyerProfile;

public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {
    List<Specialty> findByLawyer(LawyerProfile lawyer);
}
