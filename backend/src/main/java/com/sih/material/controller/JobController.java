package com.sih.material.controller;

import com.sih.material.dto.common.ApiResponse;
import com.sih.material.dto.common.PaginatedResponse;
import com.sih.material.dto.job.JobProgressResponse;
import com.sih.material.entity.ProcessingJob;
import com.sih.material.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Jobs", description = "Endpoints for monitoring background ingestion jobs and progress")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/{jobId}")
    @Operation(summary = "Get processing job status, record counts, and real computed percentage progress")
    public ResponseEntity<ApiResponse<JobProgressResponse>> getJobProgress(@PathVariable String jobId) {
        JobProgressResponse response = jobService.getJobByCode(jobId);
        return ResponseEntity.ok(ApiResponse.success("Job details retrieved", response));
    }

    @GetMapping
    @Operation(summary = "List all batch processing jobs with pagination")
    public ResponseEntity<PaginatedResponse<ProcessingJob>> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ProcessingJob> result = jobService.getJobs(pageable);
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }
}
