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
@Table(name = "material_attribute")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false, unique = true)
    private Material material;

    @Column(length = 100)
    private String category;

    @Column(name = "item_type", length = 100)
    private String itemType;

    @Column(name = "material", length = 100)
    private String materialName; // db column 'material'

    @Column(length = 50)
    private String grade;

    @Column(length = 50)
    private String diameter;

    @Column(length = 50)
    private String length;

    @Column(length = 50)
    private String width;

    @Column(length = 50)
    private String height;

    @Column(name = "pressure_class", length = 50)
    private String pressureClass;

    @Column(length = 50)
    private String voltage;

    @Column(length = 30)
    private String unit;

    @Column(length = 100)
    private String manufacturer;

    @Column(length = 100)
    private String model;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "additional_attributes", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> additionalAttributes = new HashMap<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
