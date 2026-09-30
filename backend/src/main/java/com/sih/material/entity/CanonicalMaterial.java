package com.sih.material.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "canonical_material")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanonicalMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "canonical_code", nullable = false, unique = true, length = 100)
    private String canonicalCode;

    @Column(name = "standard_name", nullable = false)
    private String standardName;

    @Column(length = 100)
    private String category;

    @Column(name = "taxonomy_id")
    private Long taxonomyId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, DEPRECATED

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
