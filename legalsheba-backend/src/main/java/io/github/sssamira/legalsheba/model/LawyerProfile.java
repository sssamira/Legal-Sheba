package io.github.sssamira.legalsheba.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lawyer_profiles", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id"})})
public class LawyerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_lawyer_user"))
    private UserEntity user;

    private Integer experience;

    @Size(max = 255)
    private String location;

    @Column(name = "court_of_practice", length = 255)
    private String courtOfPractice;

    @Column(name = "availability_details")
    private String availabilityDetails;

    @Column(name = "v_hour", length = 255)
    private String vHour;
}
