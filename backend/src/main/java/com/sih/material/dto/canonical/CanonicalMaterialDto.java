package com.sih.material.dto.canonical;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanonicalMaterialDto {
    private Long id;
    private String canonicalCode;
    private String standardName;
    private String category;
    private Long taxonomyId;
    private String taxonomyName;
    private String description;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
