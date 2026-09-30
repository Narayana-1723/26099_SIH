package com.sih.material.controller;

import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.job.JobSummaryDto;
import com.sih.material.entity.Cpse;
import com.sih.material.repository.CpseRepository;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/api/materials", "/api"})
@Slf4j
@Tag(name = "Upload & Ingestion", description = "Endpoints for batch material uploads (CSV, XLSX, JSON)")
public class UploadController {

    private final UploadService uploadService;
    private final CpseRepository cpseRepository;

    public UploadController(UploadService uploadService, CpseRepository cpseRepository) {
        this.uploadService = uploadService;
        this.cpseRepository = cpseRepository;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload material catalog file (CSV, XLSX, JSON) for background ingestion and attribute extraction")
    public ResponseEntity<ApiResponse<JobSummaryDto>> uploadMaterialFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cpseId", required = false) Long cpseId,
            @RequestParam(value = "cpse", required = false) String cpse,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Long resolvedCpseId = cpseId;
        if (resolvedCpseId == null && cpse != null && !cpse.isBlank()) {
            try {
                resolvedCpseId = Long.parseLong(cpse.trim());
            } catch (NumberFormatException ignored) {
                resolvedCpseId = cpseRepository.findByCode(cpse.trim())
                        .map(Cpse::getId)
                        .orElseGet(() -> cpseRepository.findByName(cpse.trim())
                                .map(Cpse::getId)
                                .orElse(null));
            }
        }

        if (resolvedCpseId == null && currentUser != null && currentUser.getCpseId() != null) {
            resolvedCpseId = currentUser.getCpseId();
        }

        if (resolvedCpseId == null) {
            List<Cpse> active = cpseRepository.findAll();
            if (!active.isEmpty()) {
                resolvedCpseId = active.get(0).getId();
            } else {
                throw new IllegalArgumentException("No CPSE found to associate with this upload.");
            }
        }

        Long userId = currentUser != null ? currentUser.getId() : 1L;
        JobSummaryDto jobSummary = uploadService.uploadMaterialFile(file, resolvedCpseId, userId);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("File accepted for processing", jobSummary));
    }
}

