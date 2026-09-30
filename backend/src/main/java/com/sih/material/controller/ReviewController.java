package com.sih.material.controller;

import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.common.PaginatedResponse;
import com.sih.material.dto.review.ReviewApproveRequest;
import com.sih.material.dto.review.ReviewModifyRequest;
import com.sih.material.dto.review.ReviewRejectRequest;
import com.sih.material.dto.review.ReviewResponse;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Human Review", description = "Endpoints for reviewing, approving, rejecting, and modifying AI match candidates")
@PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER')")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "Get paginated human review queue records")
    public ResponseEntity<PaginatedResponse<ReviewResponse>> getReviews(
            @RequestParam(required = false) String decision,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ReviewResponse> result = reviewService.getReviews(decision, pageable);
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get review record by ID")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long id) {
        ReviewResponse response = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved successfully", response));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve material match candidate and harmonize into canonical catalog")
    public ResponseEntity<ApiResponse<ReviewResponse>> approveReview(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewApproveRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        if (request == null) {
            request = new ReviewApproveRequest();
        }
        ReviewResponse response = reviewService.approveReview(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Material match approved and harmonized", response));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject material match candidate and keep material records separate")
    public ResponseEntity<ApiResponse<ReviewResponse>> rejectReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRejectRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        ReviewResponse response = reviewService.rejectReview(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Material match rejected", response));
    }

    @PostMapping("/{id}/modify")
    @Operation(summary = "Modify canonical mapping or attribute overrides before approval")
    public ResponseEntity<ApiResponse<ReviewResponse>> modifyReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewModifyRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        ReviewResponse response = reviewService.modifyReview(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Material match modified and harmonized", response));
    }
}
