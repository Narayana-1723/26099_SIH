package com.sih.material.controller;

import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.cpse.CpseCreateRequest;
import com.sih.material.dto.cpse.CpseDto;
import com.sih.material.service.CpseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cpse")
@Tag(name = "CPSE", description = "Central Public Sector Enterprises directory endpoints")
public class CpseController {

    private final CpseService cpseService;

    public CpseController(CpseService cpseService) {
        this.cpseService = cpseService;
    }

    @GetMapping
    @Operation(summary = "List all active Central Public Sector Enterprises")
    public ResponseEntity<ApiResponse<List<CpseDto>>> getActiveCpses() {
        List<CpseDto> list = cpseService.getAllActiveCpses();
        return ResponseEntity.ok(ApiResponse.success("CPSEs retrieved successfully", list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get CPSE details by ID")
    public ResponseEntity<ApiResponse<CpseDto>> getCpseById(@PathVariable Long id) {
        CpseDto dto = cpseService.getCpseById(id);
        return ResponseEntity.ok(ApiResponse.success("CPSE retrieved successfully", dto));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register a new CPSE (ADMIN only)")
    public ResponseEntity<ApiResponse<CpseDto>> createCpse(@Valid @RequestBody CpseCreateRequest request) {
        CpseDto created = cpseService.createCpse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("CPSE created successfully", created));
    }
}
