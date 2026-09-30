package com.sih.material.dto.canonical;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanonicalUpdateRequest {

    @Size(max = 255, message = "Standard name must not exceed 255 characters")
    private String standardName;

    private String category;
    private Long taxonomyId;
    private String description;
    private String status;
}
