package com.sih.material.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "processing_job")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessingJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_code", nullable = false, unique = true, length = 100)
    private String jobCode;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "cpse_id", nullable = false)
    private Long cpseId;

    @Column(name = "total_records", nullable = false)
    @Builder.Default
    private Integer totalRecords = 0;

    @Column(name = "processed_records", nullable = false)
    @Builder.Default
    private Integer processedRecords = 0;

    @Column(name = "failed_records", nullable = false)
    @Builder.Default
    private Integer failedRecords = 0;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "QUEUED"; // QUEUED, PROCESSING, COMPLETED, FAILED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Transient
    public int getProgress() {
        if (totalRecords == null || totalRecords == 0) {
            return "COMPLETED".equals(status) ? 100 : 0;
        }
        int progress = (int) (((long) (processedRecords + failedRecords) * 100) / totalRecords);
        return Math.min(100, Math.max(0, progress));
    }
}
