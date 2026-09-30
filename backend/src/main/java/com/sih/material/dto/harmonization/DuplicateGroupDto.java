package com.sih.material.dto.harmonization;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuplicateGroupDto {
    private String groupId;
    private String standardName;
    private String canonicalCode;
    private Double confidence;
    private List<DuplicateMaterialItemDto> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DuplicateMaterialItemDto {
        private Long materialId;
        private String cpseCode;
        private String cpseName;
        private String materialCode;
        private String originalDescription;
        private String normalizedDescription;
        private String status;
    }
}
