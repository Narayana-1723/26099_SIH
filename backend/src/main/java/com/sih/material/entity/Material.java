package com.sih.material.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "material")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cpse_id", nullable = false)
    private Long cpseId;

    @Column(name = "original_material_code", nullable = false, length = 100)
    private String originalMaterialCode;

    @Column(name = "original_description", nullable = false, columnDefinition = "TEXT")
    private String originalDescription;

    @Column(name = "normalized_description", columnDefinition = "TEXT")
    private String normalizedDescription;

    @Column(name = "source_file")
    private String sourceFile;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "RAW"; // RAW, PROCESSING, PROCESSED, REVIEW_REQUIRED, HARMONIZED, REJECTED

    @OneToOne(mappedBy = "material", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private MaterialAttribute attributes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
