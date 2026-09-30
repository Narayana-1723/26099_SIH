package com.sih.material.dto.material;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialCreateRequest {

    @NotNull(message = "CPSE ID is required")
    private Long cpseId;

    @NotBlank(message = "Original Material Code is required")
    private String originalMaterialCode;

    @NotBlank(message = "Original Description is required")
    private String originalDescription;

    private String sourceFile;

    // Optional manual attributes
    private String category;
    private String itemType;
    private String material;
    private String grade;
    private String diameter;
    private String length;
    private String width;
    private String height;
    private String pressureClass;
    private String voltage;
    private String unit;
    private String manufacturer;
    private String model;
    private Map<String, Object> additionalAttributes;
}
