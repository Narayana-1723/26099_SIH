package com.sih.material.dto.job;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobProgressResponse {
    private String jobId;
    private String status;
    private int totalRecords;
    private int processedRecords;
    private int failedRecords;
    private int progress;
    private String errorMessage;
    private Instant startedAt;
    private Instant completedAt;
}
