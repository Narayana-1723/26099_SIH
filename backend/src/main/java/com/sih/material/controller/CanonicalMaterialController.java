package com.sih.material.controller;

import com.sih.material.dto.canonical.CanonicalCreateRequest;
import com.sih.material.dto.canonical.CanonicalMaterialDto;
import com.sih.material.dto.canonical.CanonicalUpdateRequest;
import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.common.PaginatedResponse;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.CanonicalMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/canonical-materials")
@Tag(name = "Canonical Materials", description = "Unified standardized catalog endpoints")
public class CanonicalMaterialController {

    private final CanonicalMaterialService canonicalService;

    public CanonicalMaterialController(CanonicalMaterialService canonicalService) {
        this.canonicalService = canonicalService;
    }

    @GetMapping
    @Operation(summary = "Get paginated canonical material catalog")
    public ResponseEntity<PaginatedResponse<CanonicalMaterialDto>> getCanonicalMaterials(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<CanonicalMaterialDto> result;
        if (query != null && !query.isBlank()) {
            result = canonicalService.searchCanonical(query, pageable);
        } else {
            result = canonicalService.getCanonicalMaterials(pageable);
        }
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get canonical material by ID")
    public ResponseEntity<ApiResponse<CanonicalMaterialDto>> getCanonicalById(@PathVariable Long id) {
        CanonicalMaterialDto dto = canonicalService.getCanonicalById(id);
        return ResponseEntity.ok(ApiResponse.success("Canonical material retrieved", dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER')")
    @Operation(summary = "Create a new standardized canonical material entry")
    public ResponseEntity<ApiResponse<CanonicalMaterialDto>> createCanonical(
            @Valid @RequestBody CanonicalCreateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        CanonicalMaterialDto created = canonicalService.createCanonical(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Canonical material created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER')")
    @Operation(summary = "Update standard specifications of a canonical material")
    public ResponseEntity<ApiResponse<CanonicalMaterialDto>> updateCanonical(
            @PathVariable Long id,
            @Valid @RequestBody CanonicalUpdateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        CanonicalMaterialDto updated = canonicalService.updateCanonical(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Canonical material updated", updated));
    }
}
