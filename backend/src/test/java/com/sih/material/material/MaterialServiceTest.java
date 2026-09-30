package com.sih.material.material;

import com.sih.material.dto.material.MaterialCreateRequest;
import com.sih.material.dto.material.MaterialResponse;
import com.sih.material.entity.Material;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.CpseRepository;
import com.sih.material.repository.MaterialAttributeRepository;
import com.sih.material.repository.MaterialRepository;
import com.sih.material.service.AuditService;
import com.sih.material.service.MaterialService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaterialServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialAttributeRepository attributeRepository;

    @Mock
    private CpseRepository cpseRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MaterialService materialService;

    private Material sampleMaterial;

    @BeforeEach
    void setUp() {
        sampleMaterial = Material.builder()
                .id(10L)
                .cpseId(1L)
                .originalMaterialCode("MAT-001")
                .originalDescription("Hex bolt SS316")
                .normalizedDescription("hex bolt ss316")
                .status("PROCESSED")
                .build();
    }

    @Test
    void getMaterialById_Success() {
        when(materialRepository.findById(10L)).thenReturn(Optional.of(sampleMaterial));

        MaterialResponse resp = materialService.getMaterialById(10L);

        assertNotNull(resp);
        assertEquals("MAT-001", resp.getOriginalMaterialCode());
        assertEquals("Hex bolt SS316", resp.getOriginalDescription());
    }

    @Test
    void getMaterialById_NotFound_ThrowsException() {
        when(materialRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> materialService.getMaterialById(999L));
    }

    @Test
    void createMaterial_Success() {
        MaterialCreateRequest req = MaterialCreateRequest.builder()
                .cpseId(1L)
                .originalMaterialCode("NEW-BOLT-01")
                .originalDescription("Stainless Steel Hex Bolt M16")
                .category("Fasteners")
                .build();

        when(cpseRepository.existsById(1L)).thenReturn(true);
        when(materialRepository.findByCpseIdAndOriginalMaterialCode(1L, "NEW-BOLT-01")).thenReturn(Optional.empty());
        when(materialRepository.save(any(Material.class))).thenAnswer(i -> {
            Material m = i.getArgument(0);
            m.setId(20L);
            return m;
        });

        MaterialResponse resp = materialService.createMaterial(req, 1L);

        assertNotNull(resp);
        assertEquals("NEW-BOLT-01", resp.getOriginalMaterialCode());
        verify(attributeRepository, times(1)).save(any());
        verify(auditService, times(1)).log(eq(1L), eq("MATERIAL_CREATE"), eq("MATERIAL"), any(), any(), any());
    }

    @Test
    void createMaterial_DuplicateCode_ThrowsValidationException() {
        MaterialCreateRequest req = MaterialCreateRequest.builder()
                .cpseId(1L)
                .originalMaterialCode("MAT-001")
                .originalDescription("Duplicate code bolt")
                .build();

        when(cpseRepository.existsById(1L)).thenReturn(true);
        when(materialRepository.findByCpseIdAndOriginalMaterialCode(1L, "MAT-001")).thenReturn(Optional.of(sampleMaterial));

        assertThrows(ValidationException.class, () -> materialService.createMaterial(req, 1L));
    }
}
