package com.sih.material.controller;

import com.sih.material.dto.auth.AuthResponse;
import com.sih.material.dto.auth.LoginRequest;
import com.sih.material.dto.auth.RegisterRequest;
import com.sih.material.dto.auth.UserSummaryDto;
import com.sih.material.dto.common.ApiResponse;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for employee login, registration, session inspection, and logout")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Public registration for new CPSE personnel (always assigns USER role)")
    public ResponseEntity<ApiResponse<UserSummaryDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserSummaryDto created = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully. Please sign in.", created));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT bearer token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal SecurityUser currentUser) {
        UserSummaryDto user = authService.getCurrentUser(currentUser.getEmployeeId());
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate session state")
    public ResponseEntity<ApiResponse<String>> logout(@AuthenticationPrincipal SecurityUser currentUser) {
        if (currentUser != null) {
            authService.logout(currentUser.getId());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
