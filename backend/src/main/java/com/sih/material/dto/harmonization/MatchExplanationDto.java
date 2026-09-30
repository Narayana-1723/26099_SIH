package com.sih.material.dto.harmonization;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchExplanationDto {
    private String reason;
    private Double semanticScore;
    private Double lexicalScore;
    private Double attributeScore;
    private Double finalConfidence;
    private List<String> matchedAttributes;
    private List<String> conflictingAttributes;
    private Map<String, Object> details;
}
