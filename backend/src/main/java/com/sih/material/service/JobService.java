package com.sih.material.service;

import com.sih.material.dto.job.JobProgressResponse;
import com.sih.material.entity.ProcessingJob;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.repository.ProcessingJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobService {

    private final ProcessingJobRepository jobRepository;

    public JobProgressResponse getJobByCode(String jobCode) {
        ProcessingJob job = jobRepository.findByJobCode(jobCode)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with code: " + jobCode));

        return JobProgressResponse.builder()
                .jobId(job.getJobCode())
                .status(job.getStatus())
                .totalRecords(job.getTotalRecords())
                .processedRecords(job.getProcessedRecords())
                .failedRecords(job.getFailedRecords())
                .progress(job.getProgress())
                .errorMessage(job.getErrorMessage())
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }

    public Page<ProcessingJob> getJobs(Pageable pageable) {
        return jobRepository.findAll(pageable);
    }
}
