package com.sih.material.dto.review;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRejectRequest {

    @NotBlank(message = "Rejection comments/reason is required")
    private String comments;
}
