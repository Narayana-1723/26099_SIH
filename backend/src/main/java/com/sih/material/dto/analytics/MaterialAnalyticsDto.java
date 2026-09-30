package com.sih.material.dto.analytics;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialAnalyticsDto {
    private long totalMaterials;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> cpseDistribution;
}
