package com.sih.material.dto.cpse;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CpseDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
