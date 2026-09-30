package com.sih.material.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserSummaryDto user;
}
