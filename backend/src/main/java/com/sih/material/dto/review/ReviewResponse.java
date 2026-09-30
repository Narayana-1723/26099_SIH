package com.sih.material.dto.review;

import com.sih.material.dto.harmonization.HarmonizationResultResponse;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long materialMatchId;
    private HarmonizationResultResponse matchDetails;
    private Long reviewerId;
    private String reviewerName;
    private String decision;
    private String comments;
    private Instant reviewedAt;
}
