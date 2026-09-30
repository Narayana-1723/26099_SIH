package com.sih.material.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Pattern(regexp = "ADMIN|USER|REVIEWER", message = "Role must be ADMIN, USER, or REVIEWER")
    private String role;

    private Long cpseId;

    private Boolean active;
}
