package com.sih.material.dto.analytics;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewAnalyticsDto {
    private long totalReviews;
    private long approvedReviews;
    private long rejectedReviews;
    private long modifiedReviews;
    private Map<String, Long> decisionBreakdown;
    private Map<String, Long> reviewerActivity;
}
