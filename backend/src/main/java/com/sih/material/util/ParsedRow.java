package com.sih.material.util;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedRow {
    private int rowNumber;
    private String materialCode;
    private String description;
    @Builder.Default
    private Map<String, String> attributes = new HashMap<>();
}
