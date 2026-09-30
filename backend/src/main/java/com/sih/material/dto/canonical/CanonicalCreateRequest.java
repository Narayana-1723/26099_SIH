package com.sih.material.dto.canonical;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanonicalCreateRequest {

    @NotBlank(message = "Canonical code is required")
    @Size(max = 100, message = "Canonical code must not exceed 100 characters")
    private String canonicalCode;

    @NotBlank(message = "Standard name is required")
    @Size(max = 255, message = "Standard name must not exceed 255 characters")
    private String standardName;

    private String category;
    private Long taxonomyId;
    private String description;
    @Builder.Default
    private String status = "ACTIVE";
}
