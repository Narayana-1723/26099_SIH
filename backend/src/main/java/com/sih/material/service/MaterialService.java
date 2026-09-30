package com.sih.material.service;

import com.sih.material.dto.material.*;
import com.sih.material.entity.Cpse;
import com.sih.material.entity.Material;
import com.sih.material.entity.MaterialAttribute;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.CpseRepository;
import com.sih.material.repository.MaterialAttributeRepository;
import com.sih.material.repository.MaterialRepository;
import com.sih.material.util.ValidationUtil;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialAttributeRepository attributeRepository;
    private final CpseRepository cpseRepository;
    private final AuditService auditService;

    public Page<MaterialResponse> getMaterials(
            Long cpseId,
            String category,
            String status,
            String materialName,
            String grade,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase("DESC") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Material> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (cpseId != null) {
                predicates.add(cb.equal(root.get("cpseId"), cpseId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }

            if ((category != null && !category.isBlank()) ||
                (materialName != null && !materialName.isBlank()) ||
                (grade != null && !grade.isBlank())) {
                Join<Material, MaterialAttribute> attrJoin = root.join("attributes", JoinType.LEFT);
                if (category != null && !category.isBlank()) {
                    predicates.add(cb.equal(cb.lower(attrJoin.get("category")), category.trim().toLowerCase()));
                }
                if (materialName != null && !materialName.isBlank()) {
                    predicates.add(cb.equal(cb.lower(attrJoin.get("materialName")), materialName.trim().toLowerCase()));
                }
                if (grade != null && !grade.isBlank()) {
                    predicates.add(cb.equal(cb.lower(attrJoin.get("grade")), grade.trim().toLowerCase()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return materialRepository.findAll(spec, pageable).map(this::toResponse);
    }

    public MaterialResponse getMaterialById(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
        return toResponse(material);
    }

    public Page<MaterialResponse> searchMaterials(MaterialSearchRequest request) {
        Sort sort = request.getSortDirection().equalsIgnoreCase("DESC") ?
                Sort.by(request.getSortBy()).descending() : Sort.by(request.getSortBy()).ascending();
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        if (request.getQuery() != null && !request.getQuery().isBlank()) {
            return materialRepository.searchMaterials(request.getQuery().trim(), pageable).map(this::toResponse);
        }

        return getMaterials(
                request.getCpseId(),
                request.getCategory(),
                request.getStatus(),
                request.getMaterial(),
                request.getGrade(),
                request.getPage(),
                request.getSize(),
                request.getSortBy(),
                request.getSortDirection()
        );
    }

    @Transactional
    public MaterialResponse createMaterial(MaterialCreateRequest request, Long userId) {
        if (!cpseRepository.existsById(request.getCpseId())) {
            throw new ValidationException("CPSE does not exist with id: " + request.getCpseId());
        }

        Optional<Material> existing = materialRepository.findByCpseIdAndOriginalMaterialCode(
                request.getCpseId(), request.getOriginalMaterialCode().trim());
        if (existing.isPresent()) {
            throw new ValidationException("Material with code '" + request.getOriginalMaterialCode() +
                    "' already exists for this CPSE");
        }

        Material material = Material.builder()
                .cpseId(request.getCpseId())
                .originalMaterialCode(request.getOriginalMaterialCode().trim())
                .originalDescription(request.getOriginalDescription().trim())
                .normalizedDescription(ValidationUtil.normalizeText(request.getOriginalDescription()))
                .sourceFile(request.getSourceFile())
                .status("PROCESSED")
                .build();

        Material saved = materialRepository.save(material);

        // Optional attributes
        if (request.getCategory() != null || request.getItemType() != null || request.getGrade() != null) {
            MaterialAttribute attr = MaterialAttribute.builder()
                    .material(saved)
                    .category(request.getCategory())
                    .itemType(request.getItemType())
                    .materialName(request.getMaterial())
                    .grade(request.getGrade())
                    .diameter(request.getDiameter())
                    .length(request.getLength())
                    .width(request.getWidth())
                    .height(request.getHeight())
                    .pressureClass(request.getPressureClass())
                    .voltage(request.getVoltage())
                    .unit(request.getUnit())
                    .manufacturer(request.getManufacturer())
                    .model(request.getModel())
                    .additionalAttributes(request.getAdditionalAttributes() != null ? request.getAdditionalAttributes() : new java.util.HashMap<>())
                    .build();
            attributeRepository.save(attr);
            saved.setAttributes(attr);
        }

        auditService.log(userId, "MATERIAL_CREATE", "MATERIAL", saved.getId().toString(), null, "Created material " + saved.getOriginalMaterialCode());
        return toResponse(saved);
    }

    @Transactional
    public MaterialResponse updateMaterial(Long id, MaterialUpdateRequest request, Long userId) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        String oldVal = "status=" + material.getStatus();

        if (request.getNormalizedDescription() != null) {
            material.setNormalizedDescription(request.getNormalizedDescription().trim());
        }
        if (request.getStatus() != null) {
            material.setStatus(request.getStatus().trim().toUpperCase());
        }

        MaterialAttribute attr = attributeRepository.findByMaterialId(id).orElseGet(() -> {
            MaterialAttribute newAttr = MaterialAttribute.builder().material(material).build();
            return newAttr;
        });

        if (request.getCategory() != null) attr.setCategory(request.getCategory());
        if (request.getItemType() != null) attr.setItemType(request.getItemType());
        if (request.getMaterial() != null) attr.setMaterialName(request.getMaterial());
        if (request.getGrade() != null) attr.setGrade(request.getGrade());
        if (request.getDiameter() != null) attr.setDiameter(request.getDiameter());
        if (request.getLength() != null) attr.setLength(request.getLength());
        if (request.getWidth() != null) attr.setWidth(request.getWidth());
        if (request.getHeight() != null) attr.setHeight(request.getHeight());
        if (request.getPressureClass() != null) attr.setPressureClass(request.getPressureClass());
        if (request.getVoltage() != null) attr.setVoltage(request.getVoltage());
        if (request.getUnit() != null) attr.setUnit(request.getUnit());
        if (request.getManufacturer() != null) attr.setManufacturer(request.getManufacturer());
        if (request.getModel() != null) attr.setModel(request.getModel());
        if (request.getAdditionalAttributes() != null) attr.setAdditionalAttributes(request.getAdditionalAttributes());

        attributeRepository.save(attr);
        material.setAttributes(attr);
        Material updated = materialRepository.save(material);

        String newVal = "status=" + updated.getStatus();
        auditService.log(userId, "MATERIAL_UPDATE", "MATERIAL", updated.getId().toString(), oldVal, newVal);
        return toResponse(updated);
    }

    @Transactional
    public void deleteMaterial(Long id, Long userId) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        material.setStatus("REJECTED");
        materialRepository.save(material);
        auditService.log(userId, "MATERIAL_DELETE", "MATERIAL", id.toString(), null, "Marked material as REJECTED");
    }

    public MaterialResponse toResponse(Material m) {
        String cpseCode = null;
        String cpseName = null;
        Optional<Cpse> cpse = cpseRepository.findById(m.getCpseId());
        if (cpse.isPresent()) {
            cpseCode = cpse.get().getCode();
            cpseName = cpse.get().getName();
        }

        MaterialAttributeDto attrDto = null;
        MaterialAttribute attr = m.getAttributes();
        if (attr == null) {
            attr = attributeRepository.findByMaterialId(m.getId()).orElse(null);
        }

        if (attr != null) {
            attrDto = MaterialAttributeDto.builder()
                    .id(attr.getId())
                    .category(attr.getCategory())
                    .itemType(attr.getItemType())
                    .material(attr.getMaterialName())
                    .grade(attr.getGrade())
                    .diameter(attr.getDiameter())
                    .length(attr.getLength())
                    .width(attr.getWidth())
                    .height(attr.getHeight())
                    .pressureClass(attr.getPressureClass())
                    .voltage(attr.getVoltage())
                    .unit(attr.getUnit())
                    .manufacturer(attr.getManufacturer())
                    .model(attr.getModel())
                    .additionalAttributes(attr.getAdditionalAttributes())
                    .build();
        }

        return MaterialResponse.builder()
                .id(m.getId())
                .cpseId(m.getCpseId())
                .cpseCode(cpseCode)
                .cpseName(cpseName)
                .originalMaterialCode(m.getOriginalMaterialCode())
                .originalDescription(m.getOriginalDescription())
                .normalizedDescription(m.getNormalizedDescription())
                .sourceFile(m.getSourceFile())
                .status(m.getStatus())
                .attributes(attrDto)
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
