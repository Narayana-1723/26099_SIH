package com.sih.material.service;

import com.sih.material.dto.taxonomy.TaxonomyCreateRequest;
import com.sih.material.dto.taxonomy.TaxonomyNodeDto;
import com.sih.material.dto.taxonomy.TaxonomyUpdateRequest;
import com.sih.material.entity.Taxonomy;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.TaxonomyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaxonomyService {

    private final TaxonomyRepository taxonomyRepository;
    private final AuditService auditService;

    public List<TaxonomyNodeDto> getTaxonomyTree() {
        List<Taxonomy> all = taxonomyRepository.findAllByActiveTrue();
        Map<Long, TaxonomyNodeDto> dtoMap = new HashMap<>();

        for (Taxonomy t : all) {
            dtoMap.put(t.getId(), toDto(t));
        }

        List<TaxonomyNodeDto> rootNodes = new ArrayList<>();
        for (Taxonomy t : all) {
            TaxonomyNodeDto currentDto = dtoMap.get(t.getId());
            if (t.getParentId() == null) {
                rootNodes.add(currentDto);
            } else {
                TaxonomyNodeDto parentDto = dtoMap.get(t.getParentId());
                if (parentDto != null) {
                    parentDto.getChildren().add(currentDto);
                } else {
                    rootNodes.add(currentDto);
                }
            }
        }
        return rootNodes;
    }

    public TaxonomyNodeDto getTaxonomyById(Long id) {
        Taxonomy taxonomy = taxonomyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taxonomy not found with id: " + id));
        return toDto(taxonomy);
    }

    @Transactional
    public TaxonomyNodeDto createTaxonomy(TaxonomyCreateRequest request, Long adminId) {
        if (taxonomyRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new ValidationException("Taxonomy code " + request.getCode() + " already exists");
        }

        int level = 1;
        if (request.getParentId() != null) {
            Taxonomy parent = taxonomyRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent taxonomy not found with id: " + request.getParentId()));
            level = parent.getLevel() + 1;
        }

        Taxonomy taxonomy = Taxonomy.builder()
                .parentId(request.getParentId())
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName().trim())
                .description(request.getDescription())
                .level(level)
                .active(true)
                .build();

        Taxonomy saved = taxonomyRepository.save(taxonomy);
        auditService.log(adminId, "TAXONOMY_UPDATED", "TAXONOMY", saved.getId().toString(), null, "Created taxonomy " + saved.getCode());
        return toDto(saved);
    }

    @Transactional
    public TaxonomyNodeDto updateTaxonomy(Long id, TaxonomyUpdateRequest request, Long adminId) {
        Taxonomy taxonomy = taxonomyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taxonomy not found with id: " + id));

        String oldVal = "name=" + taxonomy.getName() + ", active=" + taxonomy.isActive();

        if (request.getName() != null && !request.getName().isBlank()) {
            taxonomy.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            taxonomy.setDescription(request.getDescription().trim());
        }
        if (request.getParentId() != null) {
            Taxonomy parent = taxonomyRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent taxonomy not found with id: " + request.getParentId()));
            taxonomy.setParentId(request.getParentId());
            taxonomy.setLevel(parent.getLevel() + 1);
        }
        if (request.getActive() != null) {
            taxonomy.setActive(request.getActive());
        }

        Taxonomy updated = taxonomyRepository.save(taxonomy);
        String newVal = "name=" + updated.getName() + ", active=" + updated.isActive();
        auditService.log(adminId, "TAXONOMY_UPDATED", "TAXONOMY", updated.getId().toString(), oldVal, newVal);
        return toDto(updated);
    }

    @Transactional
    public void deleteTaxonomy(Long id, Long adminId) {
        Taxonomy taxonomy = taxonomyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taxonomy not found with id: " + id));

        // Soft delete / deactivate
        taxonomy.setActive(false);
        taxonomyRepository.save(taxonomy);
        auditService.log(adminId, "TAXONOMY_UPDATED", "TAXONOMY", taxonomy.getId().toString(), "active=true", "active=false");
    }

    public TaxonomyNodeDto toDto(Taxonomy t) {
        return TaxonomyNodeDto.builder()
                .id(t.getId())
                .parentId(t.getParentId())
                .code(t.getCode())
                .name(t.getName())
                .description(t.getDescription())
                .level(t.getLevel())
                .active(t.isActive())
                .children(new ArrayList<>())
                .build();
    }
}
