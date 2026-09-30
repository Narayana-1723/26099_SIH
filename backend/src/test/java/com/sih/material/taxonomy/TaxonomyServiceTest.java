package com.sih.material.taxonomy;

import com.sih.material.dto.taxonomy.TaxonomyCreateRequest;
import com.sih.material.dto.taxonomy.TaxonomyNodeDto;
import com.sih.material.entity.Taxonomy;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.TaxonomyRepository;
import com.sih.material.service.AuditService;
import com.sih.material.service.TaxonomyService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaxonomyServiceTest {

    @Mock
    private TaxonomyRepository taxonomyRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private TaxonomyService taxonomyService;

    @Test
    void getTaxonomyTree_BuildsHierarchy() {
        Taxonomy root = Taxonomy.builder()
                .id(1L)
                .code("MECH")
                .name("Mechanical")
                .level(1)
                .active(true)
                .build();

        Taxonomy child = Taxonomy.builder()
                .id(2L)
                .parentId(1L)
                .code("MECH-FAST")
                .name("Fasteners")
                .level(2)
                .active(true)
                .build();

        when(taxonomyRepository.findAllByActiveTrue()).thenReturn(Arrays.asList(root, child));

        List<TaxonomyNodeDto> tree = taxonomyService.getTaxonomyTree();

        assertNotNull(tree);
        assertEquals(1, tree.size());
        assertEquals("MECH", tree.get(0).getCode());
        assertEquals(1, tree.get(0).getChildren().size());
        assertEquals("MECH-FAST", tree.get(0).getChildren().get(0).getCode());
    }

    @Test
    void createTaxonomy_DuplicateCode_ThrowsException() {
        TaxonomyCreateRequest req = TaxonomyCreateRequest.builder()
                .code("MECH")
                .name("Duplicate Mechanical")
                .build();

        when(taxonomyRepository.existsByCode("MECH")).thenReturn(true);

        assertThrows(ValidationException.class, () -> taxonomyService.createTaxonomy(req, 1L));
    }
}
