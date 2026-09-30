package com.sih.material.dto.taxonomy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxonomyCreateRequest {

    private Long parentId;

    @NotBlank(message = "Taxonomy code is required")
    @Size(max = 50, message = "Taxonomy code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Taxonomy name is required")
    @Size(max = 100, message = "Taxonomy name must not exceed 100 characters")
    private String name;

    private String description;

    private Integer level;
}
