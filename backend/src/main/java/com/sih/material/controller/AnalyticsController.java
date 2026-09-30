package com.sih.material.controller;

import com.sih.material.dto.analytics.*;
import com.sih.material.dto.common.ApiResponse;
import com.sih.material.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Real database metrics for materials, harmonization progress, reviews, and CPSEs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get high-level dashboard metrics and KPIs")
    public ResponseEntity<ApiResponse<AnalyticsOverviewDto>> getOverview() {
        AnalyticsOverviewDto overview = analyticsService.getOverview();
        return ResponseEntity.ok(ApiResponse.success("Overview metrics retrieved", overview));
    }

    @GetMapping("/materials")
    @Operation(summary = "Get material distribution across categories, statuses, and CPSEs")
    public ResponseEntity<ApiResponse<MaterialAnalyticsDto>> getMaterialAnalytics() {
        MaterialAnalyticsDto stats = analyticsService.getMaterialAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Material analytics retrieved", stats));
    }

    @GetMapping("/harmonization")
    @Operation(summary = "Get AI harmonization metrics, confidence averages, and match type breakdown")
    public ResponseEntity<ApiResponse<HarmonizationAnalyticsDto>> getHarmonizationAnalytics() {
        HarmonizationAnalyticsDto stats = analyticsService.getHarmonizationAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Harmonization analytics retrieved", stats));
    }

    @GetMapping("/reviews")
    @Operation(summary = "Get human review decisions, rejection rates, and reviewer throughput")
    public ResponseEntity<ApiResponse<ReviewAnalyticsDto>> getReviewAnalytics() {
        ReviewAnalyticsDto stats = analyticsService.getReviewAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Review analytics retrieved", stats));
    }

    @GetMapping("/cpse")
    @Operation(summary = "Get CPSE participation metrics and harmonization percentages")
    public ResponseEntity<ApiResponse<java.util.List<CpseAnalyticsDto.CpseStatItem>>> getCpseAnalytics() {
        CpseAnalyticsDto stats = analyticsService.getCpseAnalytics();
        return ResponseEntity.ok(ApiResponse.success("CPSE analytics retrieved", stats.getCpseStats()));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get category distribution for harmonization dashboard")
    public ResponseEntity<ApiResponse<java.util.List<CategoryStatDto>>> getCategoryDistribution() {
        return ResponseEntity.ok(ApiResponse.success("Category distribution retrieved", analyticsService.getCategoryDistribution()));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get monthly processing and harmonization trends")
    public ResponseEntity<ApiResponse<java.util.List<MonthlyTrendDto>>> getProcessingTrends() {
        return ResponseEntity.ok(ApiResponse.success("Processing trends retrieved", analyticsService.getProcessingTrends()));
    }
}
