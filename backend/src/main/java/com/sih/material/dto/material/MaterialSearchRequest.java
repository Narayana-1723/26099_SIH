package com.sih.material.dto.material;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialSearchRequest {
    private String query;
    private Long cpseId;
    private String category;
    private String status;
    private String material;
    private String grade;
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 20;
    @Builder.Default
    private String sortBy = "id";
    @Builder.Default
    private String sortDirection = "ASC";
}
