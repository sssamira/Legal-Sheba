package io.github.sssamira.legalsheba.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import io.github.sssamira.legalsheba.model.Appointment;
import io.github.sssamira.legalsheba.model.LawyerProfile;
import io.github.sssamira.legalsheba.model.UserEntity;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClient(UserEntity client);
    List<Appointment> findByLawyer(LawyerProfile lawyer);
    Page<Appointment> findByLawyerOrderByIdDesc(LawyerProfile lawyer, Pageable pageable);
    Page<Appointment> findByClientOrderByIdDesc(UserEntity client, Pageable pageable);
}
