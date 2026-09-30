package com.sih.material.review;

import com.sih.material.dto.review.ReviewApproveRequest;
import com.sih.material.dto.review.ReviewRejectRequest;
import com.sih.material.dto.review.ReviewResponse;
import com.sih.material.entity.CanonicalMaterial;
import com.sih.material.entity.Material;
import com.sih.material.entity.MaterialMatch;
import com.sih.material.entity.Review;
import com.sih.material.repository.*;
import com.sih.material.service.AuditService;
import com.sih.material.service.HarmonizationService;
import com.sih.material.service.ReviewService;
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
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private MaterialMatchRepository matchRepository;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialAttributeRepository attributeRepository;

    @Mock
    private CanonicalMaterialRepository canonicalRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HarmonizationService harmonizationService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ReviewService reviewService;

    private Material sampleMaterial;
    private MaterialMatch sampleMatch;

    @BeforeEach
    void setUp() {
        sampleMaterial = Material.builder()
                .id(1L)
                .status("REVIEW_REQUIRED")
                .originalMaterialCode("MAT-01")
                .originalDescription("Bolt")
                .build();

        sampleMatch = MaterialMatch.builder()
                .id(100L)
                .materialId(1L)
                .canonicalMaterialId(5L)
                .status("PENDING")
                .finalConfidence(0.92)
                .matchType("EXACT")
                .build();
    }

    @Test
    void approveReview_Success_HarmonizesMaterial() {
        when(matchRepository.findById(100L)).thenReturn(Optional.of(sampleMatch));
        when(materialRepository.findById(1L)).thenReturn(Optional.of(sampleMaterial));
        when(canonicalRepository.existsById(5L)).thenReturn(true);
        when(reviewRepository.findByMaterialMatchId(100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(500L);
            return r;
        });

        ReviewApproveRequest req = new ReviewApproveRequest("Verified and approved", null);
        ReviewResponse resp = reviewService.approveReview(100L, req, 2L);

        assertNotNull(resp);
        assertEquals("APPROVE", resp.getDecision());
        assertEquals("APPROVED", sampleMatch.getStatus());
        assertEquals("HARMONIZED", sampleMaterial.getStatus());

        verify(materialRepository, times(1)).save(sampleMaterial);
        verify(matchRepository, times(1)).save(sampleMatch);
        verify(auditService, times(1)).log(eq(2L), eq("REVIEW_APPROVED"), eq("MATERIAL_MATCH"), eq("100"), any(), any());
    }

    @Test
    void rejectReview_Success_KeepsSeparate() {
        when(matchRepository.findById(100L)).thenReturn(Optional.of(sampleMatch));
        when(materialRepository.findById(1L)).thenReturn(Optional.of(sampleMaterial));
        when(reviewRepository.findByMaterialMatchId(100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(501L);
            return r;
        });

        ReviewRejectRequest req = new ReviewRejectRequest("Different pitch thread");
        ReviewResponse resp = reviewService.rejectReview(100L, req, 2L);

        assertNotNull(resp);
        assertEquals("REJECT", resp.getDecision());
        assertEquals("REJECTED", sampleMatch.getStatus());
        assertEquals("PROCESSED", sampleMaterial.getStatus());

        verify(materialRepository, times(1)).save(sampleMaterial);
        verify(matchRepository, times(1)).save(sampleMatch);
        verify(auditService, times(1)).log(eq(2L), eq("REVIEW_REJECTED"), eq("MATERIAL_MATCH"), eq("100"), any(), any());
    }
}
