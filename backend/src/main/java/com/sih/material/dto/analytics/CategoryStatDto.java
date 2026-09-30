package com.sih.material.dto.analytics;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryStatDto {
    private String category;
    private long count;
    private double percentage;
    private long harmonizedCount;
}
