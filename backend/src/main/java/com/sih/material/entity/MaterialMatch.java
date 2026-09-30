package com.sih.material.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "material_match")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material_id", nullable = false)
    private Long materialId;

    @Column(name = "matched_material_id")
    private Long matchedMaterialId;

    @Column(name = "canonical_material_id")
    private Long canonicalMaterialId;

    @Column(name = "semantic_score", nullable = false)
    @Builder.Default
    private Double semanticScore = 0.0;

    @Column(name = "lexical_score", nullable = false)
    @Builder.Default
    private Double lexicalScore = 0.0;

    @Column(name = "attribute_score", nullable = false)
    @Builder.Default
    private Double attributeScore = 0.0;

    @Column(name = "final_confidence", nullable = false)
    @Builder.Default
    private Double finalConfidence = 0.0;

    @Column(name = "match_type", nullable = false, length = 50)
    private String matchType; // EXACT, POTENTIAL_EQUIVALENT, SIMILAR, NOT_MATCH

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "explanation", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> explanation = new HashMap<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
