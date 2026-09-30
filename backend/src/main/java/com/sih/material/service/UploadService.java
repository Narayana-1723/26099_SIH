package com.sih.material.service;

import com.sih.material.dto.job.JobSummaryDto;
import com.sih.material.entity.*;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.*;
import com.sih.material.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.Executor;

@Service
@Slf4j
public class UploadService {

    private final List<FileParser> fileParsers;
    private final CpseRepository cpseRepository;
    private final ProcessingJobRepository jobRepository;
    private final MaterialRepository materialRepository;
    private final MaterialAttributeRepository attributeRepository;
    private final CanonicalMaterialRepository canonicalRepository;
    private final MaterialMatchRepository matchRepository;
    private final AiService aiService;
    private final AuditService auditService;
    private final Executor jobTaskExecutor;

    public UploadService(List<FileParser> fileParsers,
                         CpseRepository cpseRepository,
                         ProcessingJobRepository jobRepository,
                         MaterialRepository materialRepository,
                         MaterialAttributeRepository attributeRepository,
                         CanonicalMaterialRepository canonicalRepository,
                         MaterialMatchRepository matchRepository,
                         AiService aiService,
                         AuditService auditService,
                         @Qualifier("jobTaskExecutor") Executor jobTaskExecutor) {
        this.fileParsers = fileParsers;
        this.cpseRepository = cpseRepository;
        this.jobRepository = jobRepository;
        this.materialRepository = materialRepository;
        this.attributeRepository = attributeRepository;
        this.canonicalRepository = canonicalRepository;
        this.matchRepository = matchRepository;
        this.aiService = aiService;
        this.auditService = auditService;
        this.jobTaskExecutor = jobTaskExecutor;
    }

    public JobSummaryDto uploadMaterialFile(MultipartFile file, Long cpseId, Long userId) {
        ValidationUtil.validateFile(file);

        if (!cpseRepository.existsById(cpseId)) {
            throw new ResourceNotFoundException("CPSE does not exist with id: " + cpseId);
        }

        String filename = file.getOriginalFilename();
        FileParser selectedParser = fileParsers.stream()
                .filter(p -> p.supports(filename))
                .findFirst()
                .orElseThrow(() -> new ValidationException("No suitable parser found for file: " + filename));

        List<ParsedRow> rows;
        try (InputStream inputStream = file.getInputStream()) {
            rows = selectedParser.parse(inputStream);
        } catch (ValidationException ve) {
            throw ve;
        } catch (Exception e) {
            throw new ValidationException("Failed to read uploaded file: " + e.getMessage());
        }

        // Generate job code
        String jobCode = "JOB-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ProcessingJob job = ProcessingJob.builder()
                .jobCode(jobCode)
                .fileName(filename)
                .cpseId(cpseId)
                .totalRecords(rows.size())
                .processedRecords(0)
                .failedRecords(0)
                .status("QUEUED")
                .createdAt(Instant.now())
                .build();

        ProcessingJob savedJob = jobRepository.save(job);
        auditService.log(userId, "MATERIAL_UPLOAD", "PROCESSING_JOB", savedJob.getId().toString(), null, "Uploaded " + filename + " with " + rows.size() + " records");

        // Kick off asynchronous ingestion
        // Dispatch through the executor explicitly. Calling an @Async method on
        // this same instance bypasses Spring's proxy and runs ingestion inline.
        jobTaskExecutor.execute(() -> processJob(savedJob.getId(), rows, cpseId, filename, userId));

        return JobSummaryDto.builder()
                .jobId(jobCode)
                .status("QUEUED")
                .recordsReceived(rows.size())
                .fileName(filename)
                .build();
    }

    public void processJob(Long jobId, List<ParsedRow> rows, Long cpseId, String filename, Long userId) {
        ProcessingJob job = jobRepository.findById(jobId).orElse(null);
        if (job == null) return;

        job.setStatus("PROCESSING");
        job.setStartedAt(Instant.now());
        jobRepository.save(job);

        int processed = 0;
        int failed = 0;

        List<CanonicalMaterial> canonicalCatalog = canonicalRepository.findAll();

        for (ParsedRow row : rows) {
            try {
                processSingleRow(row, cpseId, filename, canonicalCatalog);
                processed++;
            } catch (Exception e) {
                log.warn("Failed to process row {}: {}", row.getRowNumber(), e.getMessage());
                failed++;
            }

            // Periodically update progress in DB
            if ((processed + failed) % 10 == 0 || (processed + failed) == rows.size()) {
                job.setProcessedRecords(processed);
                job.setFailedRecords(failed);
                jobRepository.save(job);
            }
        }

        job.setProcessedRecords(processed);
        job.setFailedRecords(failed);
        job.setStatus("COMPLETED");
        job.setCompletedAt(Instant.now());
        jobRepository.save(job);

        log.info("Finished processing job {}: {} processed, {} failed", job.getJobCode(), processed, failed);
    }

    @Transactional
    public void processSingleRow(ParsedRow row, Long cpseId, String filename, List<CanonicalMaterial> canonicalCatalog) {
        String code = row.getMaterialCode();
        String desc = row.getDescription();
        String normDesc = ValidationUtil.normalizeText(desc);

        // Check if material already exists for this CPSE
        Material material = materialRepository.findByCpseIdAndOriginalMaterialCode(cpseId, code)
                .orElseGet(() -> Material.builder()
                        .cpseId(cpseId)
                        .originalMaterialCode(code)
                        .originalDescription(desc)
                        .normalizedDescription(normDesc)
                        .sourceFile(filename)
                        .status("PROCESSING")
                        .build());

        material.setNormalizedDescription(normDesc);
        material.setSourceFile(filename);
        Material savedMaterial = materialRepository.save(material);

        // Attribute extraction via AI ML service (or fallback to row columns)
        Map<String, Object> extracted = new HashMap<>();
        try {
            extracted = aiService.extractAttributes(code, desc);
        } catch (Exception e) {
            log.debug("AI extraction failed for row {}, falling back to parsed columns: {}", row.getRowNumber(), e.getMessage());
        }

        // Merge attributes from row
        for (Map.Entry<String, String> entry : row.getAttributes().entrySet()) {
            extracted.putIfAbsent(entry.getKey(), entry.getValue());
        }

        MaterialAttribute attr = attributeRepository.findByMaterialId(savedMaterial.getId()).orElseGet(() ->
                MaterialAttribute.builder().material(savedMaterial).build());

        if (extracted.containsKey("category")) attr.setCategory(extracted.get("category").toString());
        if (extracted.containsKey("itemType")) attr.setItemType(extracted.get("itemType").toString());
        if (extracted.containsKey("material")) attr.setMaterialName(extracted.get("material").toString());
        if (extracted.containsKey("grade")) attr.setGrade(extracted.get("grade").toString());
        if (extracted.containsKey("diameter")) attr.setDiameter(extracted.get("diameter").toString());
        if (extracted.containsKey("length")) attr.setLength(extracted.get("length").toString());
        if (extracted.containsKey("width")) attr.setWidth(extracted.get("width").toString());
        if (extracted.containsKey("height")) attr.setHeight(extracted.get("height").toString());
        if (extracted.containsKey("pressureClass")) attr.setPressureClass(extracted.get("pressureClass").toString());
        if (extracted.containsKey("voltage")) attr.setVoltage(extracted.get("voltage").toString());
        if (extracted.containsKey("unit")) attr.setUnit(extracted.get("unit").toString());
        if (extracted.containsKey("manufacturer")) attr.setManufacturer(extracted.get("manufacturer").toString());
        if (extracted.containsKey("model")) attr.setModel(extracted.get("model").toString());

        attr.setAdditionalAttributes(extracted);
        attributeRepository.save(attr);
        savedMaterial.setAttributes(attr);

        // Harmonization matching candidate generation
        boolean matchFound = false;
        if (canonicalCatalog != null && !canonicalCatalog.isEmpty()) {
            for (CanonicalMaterial cm : canonicalCatalog) {
                if (normDesc.contains(cm.getStandardName().toLowerCase()) ||
                    (attr.getGrade() != null && cm.getStandardName().toLowerCase().contains(attr.getGrade().toLowerCase()) &&
                     attr.getDiameter() != null && cm.getStandardName().toLowerCase().contains(attr.getDiameter().toLowerCase()))) {

                    double confidence = 0.85;
                    Map<String, Object> explanation = new HashMap<>();
                    explanation.put("matchedCanonical", cm.getCanonicalCode());
                    explanation.put("matchedAttributes", List.of("grade", "diameter"));
                    explanation.put("reason", "Corresponds to canonical standard " + cm.getCanonicalCode());

                    MaterialMatch match = MaterialMatch.builder()
                            .materialId(savedMaterial.getId())
                            .canonicalMaterialId(cm.getId())
                            .semanticScore(0.88)
                            .lexicalScore(0.82)
                            .attributeScore(0.90)
                            .finalConfidence(confidence)
                            .matchType("POTENTIAL_EQUIVALENT")
                            .status("PENDING")
                            .explanation(explanation)
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();

                    matchRepository.save(match);
                    savedMaterial.setStatus("REVIEW_REQUIRED");
                    matchFound = true;
                    break;
                }
            }
        }

        if (!matchFound) {
            savedMaterial.setStatus("PROCESSED");
        }

        materialRepository.save(savedMaterial);
    }
}
