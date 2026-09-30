package com.sih.material.dto.material;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialUpdateRequest {

    private String normalizedDescription;
    private String status;

    // Attributes update
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
