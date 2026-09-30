package com.sih.material.dto.harmonization;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HarmonizationMatchRequest {

    @NotNull(message = "Material ID is required")
    @Positive(message = "Material ID must be a positive numeric ID")
    private Long materialId;

    @Positive(message = "Target material ID must be a positive numeric ID")
    private Long targetMaterialId;

    @Positive(message = "Canonical material ID must be a positive numeric ID")
    private Long canonicalMaterialId;

    @DecimalMin(value = "0.0", message = "Minimum confidence threshold must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Minimum confidence threshold must be between 0 and 1")
    private Double minConfidenceThreshold;
}
