package com.sih.material.dto.job;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSummaryDto {
    private String jobId;
    private String status;
    private int recordsReceived;
    private String fileName;
    @Builder.Default
    private String message = "File accepted for processing";
}
