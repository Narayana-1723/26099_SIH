package com.sih.material.service;

import com.sih.material.dto.canonical.CanonicalCreateRequest;
import com.sih.material.dto.canonical.CanonicalMaterialDto;
import com.sih.material.dto.canonical.CanonicalUpdateRequest;
import com.sih.material.entity.CanonicalMaterial;
import com.sih.material.entity.Taxonomy;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.CanonicalMaterialRepository;
import com.sih.material.repository.TaxonomyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CanonicalMaterialService {

    private final CanonicalMaterialRepository canonicalRepository;
    private final TaxonomyRepository taxonomyRepository;
    private final AuditService auditService;

    public Page<CanonicalMaterialDto> getCanonicalMaterials(Pageable pageable) {
        return canonicalRepository.findAll(pageable).map(this::toDto);
    }

    public Page<CanonicalMaterialDto> searchCanonical(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return getCanonicalMaterials(pageable);
        }
        return canonicalRepository.searchCanonical(query.trim(), pageable).map(this::toDto);
    }

    public CanonicalMaterialDto getCanonicalById(Long id) {
        CanonicalMaterial cm = canonicalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Canonical material not found with id: " + id));
        return toDto(cm);
    }

    @Transactional
    public CanonicalMaterialDto createCanonical(CanonicalCreateRequest request, Long userId) {
        if (canonicalRepository.existsByCanonicalCode(request.getCanonicalCode().trim())) {
            throw new ValidationException("Canonical material with code " + request.getCanonicalCode() + " already exists");
        }

        CanonicalMaterial cm = CanonicalMaterial.builder()
                .canonicalCode(request.getCanonicalCode().trim())
                .standardName(request.getStandardName().trim())
                .category(request.getCategory())
                .taxonomyId(request.getTaxonomyId())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        CanonicalMaterial saved = canonicalRepository.save(cm);
        auditService.log(userId, "CANONICAL_CREATED", "CANONICAL_MATERIAL", saved.getId().toString(), null, "Created " + saved.getCanonicalCode());
        return toDto(saved);
    }

    @Transactional
    public CanonicalMaterialDto updateCanonical(Long id, CanonicalUpdateRequest request, Long userId) {
        CanonicalMaterial cm = canonicalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Canonical material not found with id: " + id));

        String oldVal = "name=" + cm.getStandardName() + ", status=" + cm.getStatus();

        if (request.getStandardName() != null && !request.getStandardName().isBlank()) {
            cm.setStandardName(request.getStandardName().trim());
        }
        if (request.getCategory() != null) {
            cm.setCategory(request.getCategory().trim());
        }
        if (request.getTaxonomyId() != null) {
            cm.setTaxonomyId(request.getTaxonomyId());
        }
        if (request.getDescription() != null) {
            cm.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            cm.setStatus(request.getStatus().trim());
        }

        CanonicalMaterial updated = canonicalRepository.save(cm);
        String newVal = "name=" + updated.getStandardName() + ", status=" + updated.getStatus();
        auditService.log(userId, "CANONICAL_UPDATED", "CANONICAL_MATERIAL", updated.getId().toString(), oldVal, newVal);
        return toDto(updated);
    }

    public CanonicalMaterialDto toDto(CanonicalMaterial cm) {
        String taxonomyName = null;
        if (cm.getTaxonomyId() != null) {
            taxonomyName = taxonomyRepository.findById(cm.getTaxonomyId())
                    .map(Taxonomy::getName)
                    .orElse(null);
        }

        return CanonicalMaterialDto.builder()
                .id(cm.getId())
                .canonicalCode(cm.getCanonicalCode())
                .standardName(cm.getStandardName())
                .category(cm.getCategory())
                .taxonomyId(cm.getTaxonomyId())
                .taxonomyName(taxonomyName)
                .description(cm.getDescription())
                .status(cm.getStatus())
                .createdAt(cm.getCreatedAt())
                .updatedAt(cm.getUpdatedAt())
                .build();
    }
}
