package com.sih.material.dto.analytics;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsOverviewDto {
    private long totalMaterials;
    private long processedMaterials;
    private long harmonizedMaterials;
    private long pendingReviews;
    private long potentialDuplicates;
    private long unmappedMaterials;
    private double harmonizationPercentage;
    private Map<String, Long> materialsByCpse;
    private Map<String, Long> materialsByCategory;
    private Map<String, Long> materialsByStatus;

    public long getCanonicalMaterialsCount() {
        return harmonizedMaterials;
    }

    public double getOverallAccuracyRate() {
        return harmonizationPercentage;
    }

    public int getActiveCPSEsCount() {
        return materialsByCpse != null ? materialsByCpse.size() : 0;
    }
}
