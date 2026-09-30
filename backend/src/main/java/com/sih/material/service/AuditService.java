package com.sih.material.service;

import com.sih.material.entity.AuditLog;
import com.sih.material.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(Long userId, String action, String entityType, String entityId, String oldValue, String newValue) {
        String clientIp = getClientIp();
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(sanitize(oldValue))
                .newValue(sanitize(newValue))
                .ipAddress(clientIp)
                .timestamp(Instant.now())
                .build();

        auditLogRepository.save(auditLog);
        log.info("AUDIT: user={}, action={}, entity={}:{}", userId, action, entityType, entityId);
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    public Page<AuditLog> getLogsByUser(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable);
    }

    public Page<AuditLog> getLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {
        }
        return "127.0.0.1";
    }

    private String sanitize(String value) {
        if (value == null) return null;
        // Never log secrets or passwords
        return value.replaceAll("(?i)(\"password\"\\s*:\\s*\")[^\"]+(\")", "$1***$2")
                    .replaceAll("(?i)(\"token\"\\s*:\\s*\")[^\"]+(\")", "$1***$2");
    }
}
