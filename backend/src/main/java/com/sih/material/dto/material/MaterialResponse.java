package com.sih.material.dto.material;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialResponse {
    private Long id;
    private Long cpseId;
    private String cpseCode;
    private String cpseName;
    private String originalMaterialCode;
    private String originalDescription;
    private String normalizedDescription;
    private String sourceFile;
    private String status;
    private MaterialAttributeDto attributes;
    private Instant createdAt;
    private Instant updatedAt;

    public String getMaterialCode() {
        return originalMaterialCode;
    }

    public String getCpse() {
        return cpseCode;
    }

    public String getCategory() {
        return attributes != null ? attributes.getCategory() : null;
    }

    public String getSubCategory() {
        return attributes != null ? attributes.getItemType() : null;
    }
}
