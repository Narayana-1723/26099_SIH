package com.sih.material.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "review")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material_match_id", nullable = false)
    private Long materialMatchId;

    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;

    @Column(nullable = false, length = 30)
    private String decision; // APPROVE, REJECT, MODIFY

    @Column(columnDefinition = "TEXT")
    private String comments;

    @CreatedDate
    @Column(name = "reviewed_at", nullable = false, updatable = false)
    private Instant reviewedAt;
}
