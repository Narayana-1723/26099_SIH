package com.sih.material.dto.analytics;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HarmonizationAnalyticsDto {
    private long totalMatches;
    private long approvedMatches;
    private long pendingMatches;
    private long rejectedMatches;
    private Double averageConfidence;
    private Map<String, Long> matchTypeDistribution;
}
