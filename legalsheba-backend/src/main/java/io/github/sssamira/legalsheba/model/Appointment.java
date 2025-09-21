package io.github.sssamira.legalsheba.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false, foreignKey = @ForeignKey(name = "fk_appt_client"))
    private UserEntity client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lawyer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_appt_lawyer"))
    private LawyerProfile lawyer;

    @NotBlank
    @Column(name = "appointment_date", nullable = false, length = 50)
    private String appointmentDate;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "problem_description")
    private String problemDescription;

    private String notes;
}
