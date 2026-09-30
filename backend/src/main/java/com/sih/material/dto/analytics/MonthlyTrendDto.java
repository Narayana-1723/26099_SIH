package com.sih.material.dto.analytics;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyTrendDto {
    private String month;
    private long uploaded;
    private long harmonized;
    private long reviewed;
}
