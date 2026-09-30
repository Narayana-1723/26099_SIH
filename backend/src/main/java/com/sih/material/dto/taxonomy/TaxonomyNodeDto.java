package com.sih.material.dto.taxonomy;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxonomyNodeDto {
    private Long id;
    private Long parentId;
    private String code;
    private String name;
    private String description;
    private Integer level;
    private boolean active;
    @Builder.Default
    private List<TaxonomyNodeDto> children = new ArrayList<>();
}
