package com.sih.material.dto.harmonization;

import lombok.*;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HarmonizationResultResponse {
    private Long id;
    private Long materialId;
    private String materialCode;
    private String materialDescription;
    private String cpseCode;

    private Long matchedMaterialId;
    private String matchedMaterialCode;
    private String matchedMaterialDescription;
    private String matchedCpseCode;

    private Long canonicalMaterialId;
    private String canonicalCode;
    private String canonicalStandardName;

    private Double semanticScore;
    private Double lexicalScore;
    private Double attributeScore;
    private Double finalConfidence;
    private String matchType;
    private String status;
    private Map<String, Object> explanation;

    private Instant createdAt;
    private Instant updatedAt;
}
