package com.sih.material.dto.analytics;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CpseAnalyticsDto {

    private List<CpseStatItem> cpseStats;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CpseStatItem {
        private Long cpseId;
        private String cpseCode;
        private String cpseName;
        private long totalMaterials;
        private long harmonizedMaterials;
        private double harmonizationRate;

        public String getCpse() {
            return cpseCode != null ? cpseCode : cpseName;
        }

        public long getHarmonized() {
            return harmonizedMaterials;
        }

        public long getPendingReview() {
            return 0L;
        }

        public long getDuplicates() {
            return 0L;
        }

        public double getAccuracyRate() {
            return harmonizationRate;
        }
    }
}
