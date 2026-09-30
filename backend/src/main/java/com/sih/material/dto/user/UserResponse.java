package com.sih.material.dto.user;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private String role;
    private Long cpseId;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
