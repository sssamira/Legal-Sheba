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
@Table(name = "specialties")
public class Specialty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lawyer_id", foreignKey = @ForeignKey(name = "fk_specialty_lawyer"))
    private LawyerProfile lawyer;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;
}
