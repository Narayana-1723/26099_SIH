package com.sih.material.dto.cpse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CpseCreateRequest {

    @NotBlank(message = "CPSE Name is required")
    @Size(max = 150, message = "CPSE Name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "CPSE Code is required")
    @Size(max = 50, message = "CPSE Code must not exceed 50 characters")
    private String code;

    private String description;

    @Builder.Default
    private boolean active = true;
}
