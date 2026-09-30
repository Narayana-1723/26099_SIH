package com.sih.material.controller;

import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.common.PaginatedResponse;
import com.sih.material.dto.material.*;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/materials")
@Tag(name = "Materials", description = "Material catalog management, search, and attribute inspection")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    @Operation(summary = "Get paginated, sorted, and filtered material records")
    public ResponseEntity<PaginatedResponse<MaterialResponse>> getMaterials(
            @RequestParam(required = false) Long cpseId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String grade,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Page<MaterialResponse> result = materialService.getMaterials(
                cpseId, category, status, material, grade, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get material details by ID with extracted engineering attributes")
    public ResponseEntity<ApiResponse<MaterialResponse>> getMaterialById(@PathVariable Long id) {
        MaterialResponse response = materialService.getMaterialById(id);
        return ResponseEntity.ok(ApiResponse.success("Material retrieved successfully", response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search materials by query against code, description, and attributes")
    public ResponseEntity<PaginatedResponse<MaterialResponse>> searchMaterials(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long cpseId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String grade,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        MaterialSearchRequest request = MaterialSearchRequest.builder()
                .query(query)
                .cpseId(cpseId)
                .category(category)
                .status(status)
                .material(material)
                .grade(grade)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        Page<MaterialResponse> result = materialService.searchMaterials(request);
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @PostMapping
    @Operation(summary = "Create a new material record manually")
    public ResponseEntity<ApiResponse<MaterialResponse>> createMaterial(
            @Valid @RequestBody MaterialCreateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        MaterialResponse response = materialService.createMaterial(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Material created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing material and its extracted attributes")
    public ResponseEntity<ApiResponse<MaterialResponse>> updateMaterial(
            @PathVariable Long id,
            @Valid @RequestBody MaterialUpdateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        MaterialResponse response = materialService.updateMaterial(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Material updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Reject/deactivate material by ID")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        materialService.deleteMaterial(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Material status set to REJECTED", null));
    }
}
