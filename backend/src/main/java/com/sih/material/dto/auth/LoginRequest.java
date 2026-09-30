package com.sih.material.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @JsonAlias({"username", "user"})
    private String employeeId;

    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest(String employeeId, String password) {
        this.employeeId = employeeId;
        this.password = password;
    }

    public String getEmployeeId() {
        if (employeeId != null && !employeeId.isBlank()) {
            return employeeId;
        }
        return username;
    }

    @AssertTrue(message = "Employee ID or username is required")
    public boolean isValidIdentifier() {
        return (employeeId != null && !employeeId.isBlank()) || (username != null && !username.isBlank());
    }
}

