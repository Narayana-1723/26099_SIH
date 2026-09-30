package com.sih.material.dto.review;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewModifyRequest {

    private Long canonicalMaterialId;
    private String customCanonicalCode;
    private String customStandardName;

    @NotBlank(message = "Modification explanation/comments required")
    private String comments;

    private Map<String, Object> modifiedAttributes;
}
