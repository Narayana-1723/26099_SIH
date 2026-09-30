package com.sih.material.repository;

import com.sih.material.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByUserId(Long userId, Pageable pageable);

    Page<AuditLog> findByAction(String action, Pageable pageable);

    Page<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId, Pageable pageable);

    Page<AuditLog> findByTimestampBetween(Instant start, Instant end, Pageable pageable);
}
