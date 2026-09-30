package com.sih.material.service;

import com.sih.material.dto.review.ReviewApproveRequest;
import com.sih.material.dto.review.ReviewModifyRequest;
import com.sih.material.dto.review.ReviewRejectRequest;
import com.sih.material.dto.review.ReviewResponse;
import com.sih.material.entity.*;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MaterialMatchRepository matchRepository;
    private final MaterialRepository materialRepository;
    private final MaterialAttributeRepository attributeRepository;
    private final CanonicalMaterialRepository canonicalRepository;
    private final UserRepository userRepository;
    private final HarmonizationService harmonizationService;
    private final AuditService auditService;

    public Page<ReviewResponse> getReviews(String decision, Pageable pageable) {
        if (decision != null && !decision.isBlank()) {
            return reviewRepository.findByDecision(decision.trim().toUpperCase(), pageable).map(this::toResponse);
        }
        return reviewRepository.findAll(pageable).map(this::toResponse);
    }

    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review record not found with id: " + id));
        return toResponse(review);
    }

    @Transactional
    public ReviewResponse approveReview(Long matchId, ReviewApproveRequest request, Long reviewerId) {
        MaterialMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Material match not found with id: " + matchId));

        Material material = materialRepository.findById(match.getMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + match.getMaterialId()));

        Long canonicalId = request.getCanonicalMaterialId() != null ?
                request.getCanonicalMaterialId() : match.getCanonicalMaterialId();

        if (canonicalId != null && !canonicalRepository.existsById(canonicalId)) {
            throw new ResourceNotFoundException("Canonical material not found with id: " + canonicalId);
        }

        // 1. Update Match
        match.setStatus("APPROVED");
        if (canonicalId != null) {
            match.setCanonicalMaterialId(canonicalId);
        }
        matchRepository.save(match);

        // 2. Update Material status to HARMONIZED
        material.setStatus("HARMONIZED");
        materialRepository.save(material);

        // 3. Create or Update Review entity
        Review review = reviewRepository.findByMaterialMatchId(matchId).orElseGet(() ->
                Review.builder().materialMatchId(matchId).build());

        review.setReviewerId(reviewerId);
        review.setDecision("APPROVE");
        review.setComments(request.getComments() != null ? request.getComments() : "Approved by human reviewer");
        review.setReviewedAt(Instant.now());
        Review savedReview = reviewRepository.save(review);

        // 4. Audit Trail
        auditService.log(reviewerId, "REVIEW_APPROVED", "MATERIAL_MATCH", matchId.toString(),
                "status=PENDING", "status=APPROVED, canonicalId=" + canonicalId);

        return toResponse(savedReview);
    }

    @Transactional
    public ReviewResponse rejectReview(Long matchId, ReviewRejectRequest request, Long reviewerId) {
        MaterialMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Material match not found with id: " + matchId));

        Material material = materialRepository.findById(match.getMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + match.getMaterialId()));

        // 1. Update Match
        match.setStatus("REJECTED");
        matchRepository.save(match);

        // 2. Keep Material separate
        material.setStatus("PROCESSED");
        materialRepository.save(material);

        // 3. Record Review
        Review review = reviewRepository.findByMaterialMatchId(matchId).orElseGet(() ->
                Review.builder().materialMatchId(matchId).build());

        review.setReviewerId(reviewerId);
        review.setDecision("REJECT");
        review.setComments(request.getComments());
        review.setReviewedAt(Instant.now());
        Review savedReview = reviewRepository.save(review);

        // 4. Audit Trail
        auditService.log(reviewerId, "REVIEW_REJECTED", "MATERIAL_MATCH", matchId.toString(),
                "status=PENDING", "status=REJECTED, comments=" + request.getComments());

        return toResponse(savedReview);
    }

    @Transactional
    public ReviewResponse modifyReview(Long matchId, ReviewModifyRequest request, Long reviewerId) {
        MaterialMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Material match not found with id: " + matchId));

        Material material = materialRepository.findById(match.getMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + match.getMaterialId()));

        Long canonicalId = request.getCanonicalMaterialId();

        // Create new canonical material if requested
        if (canonicalId == null && request.getCustomCanonicalCode() != null && !request.getCustomCanonicalCode().isBlank()) {
            CanonicalMaterial newCm = CanonicalMaterial.builder()
                    .canonicalCode(request.getCustomCanonicalCode().trim())
                    .standardName(request.getCustomStandardName() != null ? request.getCustomStandardName().trim() : "Standardized Material")
                    .status("ACTIVE")
                    .build();
            CanonicalMaterial savedCm = canonicalRepository.save(newCm);
            canonicalId = savedCm.getId();
        }

        // Apply attribute overrides if provided
        if (request.getModifiedAttributes() != null && !request.getModifiedAttributes().isEmpty()) {
            MaterialAttribute attr = attributeRepository.findByMaterialId(material.getId()).orElseGet(() ->
                    MaterialAttribute.builder().material(material).build());
            attr.setAdditionalAttributes(request.getModifiedAttributes());
            attributeRepository.save(attr);
        }

        match.setStatus("APPROVED");
        if (canonicalId != null) {
            match.setCanonicalMaterialId(canonicalId);
        }
        matchRepository.save(match);

        material.setStatus("HARMONIZED");
        materialRepository.save(material);

        Review review = reviewRepository.findByMaterialMatchId(matchId).orElseGet(() ->
                Review.builder().materialMatchId(matchId).build());

        review.setReviewerId(reviewerId);
        review.setDecision("MODIFY");
        review.setComments(request.getComments());
        review.setReviewedAt(Instant.now());
        Review savedReview = reviewRepository.save(review);

        auditService.log(reviewerId, "REVIEW_MODIFIED", "MATERIAL_MATCH", matchId.toString(),
                "status=PENDING", "status=APPROVED, canonicalId=" + canonicalId);

        return toResponse(savedReview);
    }

    public ReviewResponse toResponse(Review r) {
        String reviewerName = userRepository.findById(r.getReviewerId()).map(User::getName).orElse("Unknown Reviewer");
        MaterialMatch match = matchRepository.findById(r.getMaterialMatchId()).orElse(null);

        return ReviewResponse.builder()
                .id(r.getId())
                .materialMatchId(r.getMaterialMatchId())
                .matchDetails(match != null ? harmonizationService.toResponse(match) : null)
                .reviewerId(r.getReviewerId())
                .reviewerName(reviewerName)
                .decision(r.getDecision())
                .comments(r.getComments())
                .reviewedAt(r.getReviewedAt())
                .build();
    }
}
