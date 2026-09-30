package com.sih.material.harmonization;

import com.sih.material.entity.CanonicalMaterial;
import com.sih.material.entity.Material;
import com.sih.material.entity.MaterialAttribute;
import com.sih.material.entity.MaterialMatch;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.CanonicalMaterialRepository;
import com.sih.material.repository.CpseRepository;
import com.sih.material.repository.MaterialAttributeRepository;
import com.sih.material.repository.MaterialMatchRepository;
import com.sih.material.repository.MaterialRepository;
import com.sih.material.service.AiService;
import com.sih.material.service.AuditService;
import com.sih.material.service.HarmonizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class HarmonizationServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialAttributeRepository attributeRepository;

    @Mock
    private CanonicalMaterialRepository canonicalRepository;

    @Mock
    private MaterialMatchRepository matchRepository;

    @Mock
    private CpseRepository cpseRepository;

    @Mock
    private AiService aiService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private HarmonizationService harmonizationService;

    @Test
    void getMatchResultById_RejectsNonPositiveMatchResultIds() {
        assertThrows(ValidationException.class, () -> harmonizationService.getMatchResultById(0L));
        verifyNoInteractions(matchRepository);
    }

    @Test
    void calculateLexicalSimilarity_ExactMatch() {
        double sim = harmonizationService.calculateLexicalSimilarity("hex bolt ss316 m16 x 50mm", "hex bolt ss316 m16 x 50mm");
        assertEquals(1.0, sim, 0.001);
    }

    @Test
    void calculateLexicalSimilarity_PartialMatch() {
        double sim = harmonizationService.calculateLexicalSimilarity("hex bolt ss316 m16 x 50mm", "hex bolt ss316 m16 x 100mm");
        assertTrue(sim > 0.60 && sim < 1.0);
    }

    @Test
    void computeMatch_AttributeConflictAppliesDomainPenalty() {
        Material matA = Material.builder()
                .id(1L)
                .originalDescription("M16 x 50 mm SS316 Hex Bolt")
                .normalizedDescription("m16 x 50 mm ss316 hex bolt")
                .build();

        MaterialAttribute attrA = MaterialAttribute.builder()
                .itemType("Hex Bolt")
                .materialName("Stainless Steel")
                .grade("316")
                .diameter("M16")
                .length("50 mm")
                .build();

        Material matB = Material.builder()
                .id(2L)
                .originalDescription("M16 x 100 mm SS316 Hex Bolt")
                .normalizedDescription("m16 x 100 mm ss316 hex bolt")
                .build();

        MaterialAttribute attrB = MaterialAttribute.builder()
                .itemType("Hex Bolt")
                .materialName("Stainless Steel")
                .grade("316")
                .diameter("M16")
                .length("100 mm") // Different length!
                .build();

        MaterialMatch match = harmonizationService.computeMatch(matA, attrA, matB, attrB, null);

        assertNotNull(match);
        // Explanation must document the conflict
        assertNotNull(match.getExplanation());
        assertTrue(match.getExplanation().containsKey("conflictingAttributes"));
        @SuppressWarnings("unchecked")
        List<String> conflicts = (List<String>) match.getExplanation().get("conflictingAttributes");
        assertFalse(conflicts.isEmpty());
        assertTrue(conflicts.get(0).contains("length mismatch"));

        // Match type must NOT be EXACT because of length conflict
        assertNotEquals("EXACT", match.getMatchType());
        assertTrue(match.getFinalConfidence() < 0.90);
    }
}
