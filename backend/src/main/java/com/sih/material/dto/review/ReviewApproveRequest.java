package com.sih.material.dto.review;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewApproveRequest {
    private String comments;
    private Long canonicalMaterialId; // Optional override
}
