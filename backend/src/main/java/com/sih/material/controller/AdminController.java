package com.sih.material.controller;

import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.common.PaginatedResponse;
import com.sih.material.dto.user.UserCreateRequest;
import com.sih.material.dto.user.UserResponse;
import com.sih.material.dto.user.UserStatusUpdateRequest;
import com.sih.material.dto.user.UserUpdateRequest;
import com.sih.material.entity.AuditLog;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.AiService;
import com.sih.material.service.AuditService;
import com.sih.material.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Console", description = "Administration endpoints for user management, audit logs, and system health")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuditService auditService;
    private final AiService aiService;
    private final HealthEndpoint healthEndpoint;

    public AdminController(UserService userService, AuditService auditService, AiService aiService, HealthEndpoint healthEndpoint) {
        this.userService = userService;
        this.auditService = auditService;
        this.aiService = aiService;
        this.healthEndpoint = healthEndpoint;
    }

    @GetMapping("/users")
    @Operation(summary = "List registered system users with pagination")
    public ResponseEntity<PaginatedResponse<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<UserResponse> result = userService.getUsers(pageable);
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new user with specified role (ADMIN only)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        UserResponse created = userService.createUser(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user details and credentials (ADMIN only)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        UserResponse updated = userService.updateUser(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Activate or disable user account (ADMIN only)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        UserResponse updated = userService.updateUserStatus(id, request.getActive(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User status updated", updated));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "View system audit trail with user and entity tracking")
    public ResponseEntity<PaginatedResponse<AuditLog>> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> result;

        if (userId != null) {
            result = auditService.getLogsByUser(userId, pageable);
        } else if (action != null && !action.isBlank()) {
            result = auditService.getLogsByAction(action.trim().toUpperCase(), pageable);
        } else {
            result = auditService.getAuditLogs(pageable);
        }

        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @GetMapping("/model-status")
    @Operation(summary = "Check Python FastAPI ML Service connection and model health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getModelStatus() {
        Map<String, Object> modelHealth = aiService.checkModelStatus();
        return ResponseEntity.ok(ApiResponse.success("AI Model status retrieved", modelHealth));
    }

    @GetMapping("/system-status")
    @Operation(summary = "Get application health, uptime, and database connection status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();

        // Spring Actuator Health
        HealthComponent actuatorHealth = healthEndpoint.health();
        status.put("backendStatus", "UP");
        status.put("healthStatus", actuatorHealth.getStatus().getCode());
        status.put("version", "1.0.0");
        status.put("javaVersion", System.getProperty("java.version"));
        status.put("uptimeMillis", ManagementFactory.getRuntimeMXBean().getUptime());
        status.put("timestamp", Instant.now().toString());

        // Probe ML Service
        Map<String, Object> mlStatus = aiService.checkModelStatus();
        status.put("mlServiceStatus", mlStatus.getOrDefault("status", "UNKNOWN"));

        return ResponseEntity.ok(ApiResponse.success("System status retrieved successfully", status));
    }
}
