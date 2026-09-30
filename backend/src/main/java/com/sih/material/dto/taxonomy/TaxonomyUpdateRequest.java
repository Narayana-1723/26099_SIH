package com.sih.material.dto.taxonomy;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxonomyUpdateRequest {

    private Long parentId;

    @Size(max = 100, message = "Taxonomy name must not exceed 100 characters")
    private String name;

    private String description;

    private Boolean active;
}
