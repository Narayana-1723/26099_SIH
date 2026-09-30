package com.sih.material.controller;

import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.common.PaginatedResponse;
import com.sih.material.dto.harmonization.DuplicateGroupDto;
import com.sih.material.dto.harmonization.HarmonizationMatchRequest;
import com.sih.material.dto.harmonization.HarmonizationResultResponse;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.HarmonizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/harmonization")
@Tag(name = "Harmonization", description = "AI matching, hybrid scoring, similarity evaluation, and duplicate detection")
public class HarmonizationController {

    private final HarmonizationService harmonizationService;

    public HarmonizationController(HarmonizationService harmonizationService) {
        this.harmonizationService = harmonizationService;
    }

    @PostMapping("/match")
    @Operation(summary = "Execute hybrid matching pipeline for a material against canonical catalog or target item")
    public ResponseEntity<ApiResponse<HarmonizationResultResponse>> matchMaterial(
            @Valid @RequestBody HarmonizationMatchRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        HarmonizationResultResponse response = harmonizationService.matchMaterial(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Matching evaluation completed", response));
    }

    @GetMapping("/results")
    @Operation(summary = "Get paginated harmonization match candidates and results")
    public ResponseEntity<PaginatedResponse<HarmonizationResultResponse>> getResults(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String matchType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<HarmonizationResultResponse> result = harmonizationService.getResults(status, matchType, pageable);
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @GetMapping("/{matchResultId}")
    @Operation(summary = "Get a harmonization match result by its match-result ID (not by material ID)")
    public ResponseEntity<ApiResponse<HarmonizationResultResponse>> getResultById(
            @PathVariable("matchResultId") Long matchResultId) {
        HarmonizationResultResponse response = harmonizationService.getMatchResultById(matchResultId);
        return ResponseEntity.ok(ApiResponse.success("Match retrieved successfully", response));
    }

    @GetMapping("/duplicates")
    @Operation(summary = "Detect and return potential equivalent duplicate groups across CPSEs")
    public ResponseEntity<ApiResponse<List<DuplicateGroupDto>>> getDuplicateGroups() {
        List<DuplicateGroupDto> duplicates = harmonizationService.getDuplicateGroups();
        return ResponseEntity.ok(ApiResponse.success("Potential duplicate groups retrieved", duplicates));
    }
}
