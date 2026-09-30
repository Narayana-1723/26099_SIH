package com.sih.material.controller;

import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.taxonomy.TaxonomyCreateRequest;
import com.sih.material.dto.taxonomy.TaxonomyNodeDto;
import com.sih.material.dto.taxonomy.TaxonomyUpdateRequest;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.TaxonomyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taxonomy")
@Tag(name = "Taxonomy", description = "Hierarchical taxonomy tree and categorization endpoints")
public class TaxonomyController {

    private final TaxonomyService taxonomyService;

    public TaxonomyController(TaxonomyService taxonomyService) {
        this.taxonomyService = taxonomyService;
    }

    @GetMapping({"", "/tree"})
    @Operation(summary = "Get full hierarchical taxonomy tree")
    public ResponseEntity<ApiResponse<List<TaxonomyNodeDto>>> getTaxonomyTree() {
        List<TaxonomyNodeDto> tree = taxonomyService.getTaxonomyTree();
        return ResponseEntity.ok(ApiResponse.success("Taxonomy tree retrieved", tree));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get taxonomy node by ID")
    public ResponseEntity<ApiResponse<TaxonomyNodeDto>> getTaxonomyById(@PathVariable Long id) {
        TaxonomyNodeDto node = taxonomyService.getTaxonomyById(id);
        return ResponseEntity.ok(ApiResponse.success("Taxonomy node retrieved", node));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new taxonomy node (ADMIN only)")
    public ResponseEntity<ApiResponse<TaxonomyNodeDto>> createTaxonomy(
            @Valid @RequestBody TaxonomyCreateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        TaxonomyNodeDto created = taxonomyService.createTaxonomy(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Taxonomy node created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing taxonomy node (ADMIN only)")
    public ResponseEntity<ApiResponse<TaxonomyNodeDto>> updateTaxonomy(
            @PathVariable Long id,
            @Valid @RequestBody TaxonomyUpdateRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        TaxonomyNodeDto updated = taxonomyService.updateTaxonomy(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Taxonomy node updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate taxonomy node (ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> deleteTaxonomy(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        taxonomyService.deleteTaxonomy(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Taxonomy node deactivated", null));
    }
}
