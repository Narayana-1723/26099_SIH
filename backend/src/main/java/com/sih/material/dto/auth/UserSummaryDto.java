package com.sih.material.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDto {
    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private String role;
    private Long cpseId;
    private boolean active;
}
