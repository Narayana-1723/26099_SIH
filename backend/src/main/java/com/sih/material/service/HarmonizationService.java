package com.sih.material.service;

import com.sih.material.dto.harmonization.DuplicateGroupDto;
import com.sih.material.dto.harmonization.HarmonizationMatchRequest;
import com.sih.material.dto.harmonization.HarmonizationResultResponse;
import com.sih.material.entity.CanonicalMaterial;
import com.sih.material.entity.Cpse;
import com.sih.material.entity.Material;
import com.sih.material.entity.MaterialAttribute;
import com.sih.material.entity.MaterialMatch;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.CanonicalMaterialRepository;
import com.sih.material.repository.CpseRepository;
import com.sih.material.repository.MaterialAttributeRepository;
import com.sih.material.repository.MaterialMatchRepository;
import com.sih.material.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HarmonizationService {

    private final MaterialRepository materialRepository;
    private final MaterialAttributeRepository attributeRepository;
    private final CanonicalMaterialRepository canonicalRepository;
    private final MaterialMatchRepository matchRepository;
    private final CpseRepository cpseRepository;
    private final AiService aiService;
    private final AuditService auditService;

    private static final LevenshteinDistance LEVENSHTEIN = new LevenshteinDistance();

    public Page<HarmonizationResultResponse> getResults(String status, String matchType, Pageable pageable) {
        if (status != null && !status.isBlank()) {
            return matchRepository.findByStatus(status.trim().toUpperCase(), pageable).map(this::toResponse);
        }
        if (matchType != null && !matchType.isBlank()) {
            return matchRepository.findByMatchType(matchType.trim().toUpperCase(), pageable).map(this::toResponse);
        }
        return matchRepository.findAll(pageable).map(this::toResponse);
    }

    public HarmonizationResultResponse getMatchResultById(Long matchResultId) {
        if (matchResultId == null || matchResultId <= 0) {
            throw new ValidationException("matchResultId must be a positive numeric harmonization match-result ID.");
        }
        MaterialMatch match = matchRepository.findById(matchResultId)
                .orElseThrow(() -> new ResourceNotFoundException("Harmonization match not found with id: " + matchResultId));
        return toResponse(match);
    }

    @Transactional
    public HarmonizationResultResponse matchMaterial(HarmonizationMatchRequest request, Long userId) {
        if (request == null || request.getMaterialId() == null || request.getMaterialId() <= 0) {
            throw new ValidationException("materialId is required and must be a positive numeric material ID.");
        }
        if (request.getTargetMaterialId() != null && request.getTargetMaterialId() <= 0) {
            throw new ValidationException("targetMaterialId must be a positive numeric material ID.");
        }
        if (request.getCanonicalMaterialId() != null && request.getCanonicalMaterialId() <= 0) {
            throw new ValidationException("canonicalMaterialId must be a positive numeric canonical-material ID.");
        }
        Material source = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + request.getMaterialId()));

        MaterialAttribute sourceAttr = attributeRepository.findByMaterialId(source.getId()).orElse(null);

        // Target can be an existing material or a canonical material
        if (request.getTargetMaterialId() != null) {
            Material target = materialRepository.findById(request.getTargetMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target material not found with id: " + request.getTargetMaterialId()));
            MaterialAttribute targetAttr = attributeRepository.findByMaterialId(target.getId()).orElse(null);

            MaterialMatch match = computeMatch(source, sourceAttr, target, targetAttr, null);
            MaterialMatch saved = matchRepository.save(match);
            auditService.log(userId, "AI_MATCH_CREATED", "MATERIAL_MATCH", saved.getId().toString(), null, "Created match against material " + target.getId());
            return toResponse(saved);
        }

        if (request.getCanonicalMaterialId() != null) {
            CanonicalMaterial canonical = canonicalRepository.findById(request.getCanonicalMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Canonical material not found with id: " + request.getCanonicalMaterialId()));

            MaterialMatch match = computeMatchWithCanonical(source, sourceAttr, canonical);
            MaterialMatch saved = matchRepository.save(match);
            auditService.log(userId, "AI_MATCH_CREATED", "MATERIAL_MATCH", saved.getId().toString(), null, "Created match against canonical " + canonical.getCanonicalCode());
            return toResponse(saved);
        }

        // Auto-match against canonical catalog
        List<CanonicalMaterial> canonicals = canonicalRepository.findAll();
        MaterialMatch bestMatch = null;
        double highestConfidence = -1.0;

        for (CanonicalMaterial cm : canonicals) {
            MaterialMatch candidate = computeMatchWithCanonical(source, sourceAttr, cm);
            if (candidate.getFinalConfidence() > highestConfidence) {
                highestConfidence = candidate.getFinalConfidence();
                bestMatch = candidate;
            }
        }

        if (bestMatch != null && (request.getMinConfidenceThreshold() == null || highestConfidence >= request.getMinConfidenceThreshold())) {
            MaterialMatch saved = matchRepository.save(bestMatch);
            // If match is high confidence, mark material REVIEW_REQUIRED or keep PROCESSED
            if (saved.getFinalConfidence() >= 0.70) {
                source.setStatus("REVIEW_REQUIRED");
                materialRepository.save(source);
            }
            auditService.log(userId, "AI_MATCH_CREATED", "MATERIAL_MATCH", saved.getId().toString(), null, "Auto-matched against " + bestMatch.getCanonicalMaterialId());
            return toResponse(saved);
        }

        throw new ResourceNotFoundException("No viable match found meeting the confidence threshold.");
    }

    public MaterialMatch computeMatch(Material source, MaterialAttribute sAttr, Material target, MaterialAttribute tAttr, Long canonicalId) {
        String sDesc = source.getNormalizedDescription() != null ? source.getNormalizedDescription() : source.getOriginalDescription().toLowerCase();
        String tDesc = target.getNormalizedDescription() != null ? target.getNormalizedDescription() : target.getOriginalDescription().toLowerCase();

        // 1. Lexical Similarity (Jaccard + Levenshtein)
        double lexicalScore = calculateLexicalSimilarity(sDesc, tDesc);

        // 2. Semantic Similarity
        // Call AI Service or calculate via semantic embedding
        double semanticScore = calculateSemanticSimilarity(sDesc, tDesc);

        // 3. Attribute Similarity & Conflicts
        List<String> matchedAttrs = new ArrayList<>();
        List<String> conflictingAttrs = new ArrayList<>();
        double attributeScore = calculateAttributeSimilarity(sAttr, tAttr, matchedAttrs, conflictingAttrs);

        // 4. Domain Rule Penalties
        double domainPenalty = 0.0;
        if (!conflictingAttrs.isEmpty()) {
            // E.g., length or diameter mismatch heavily penalizes
            domainPenalty = Math.min(0.35, conflictingAttrs.size() * 0.15);
        }

        // 5. Final Confidence Formula
        double rawConfidence = (semanticScore * 0.40) + (lexicalScore * 0.25) + (attributeScore * 0.35) - domainPenalty;
        double finalConfidence = Math.max(0.0, Math.min(1.0, Math.round(rawConfidence * 100.0) / 100.0));

        String matchType = classifyMatchType(finalConfidence, conflictingAttrs.isEmpty());

        Map<String, Object> explanation = new HashMap<>();
        explanation.put("semanticScore", semanticScore);
        explanation.put("lexicalScore", lexicalScore);
        explanation.put("attributeScore", attributeScore);
        explanation.put("finalConfidence", finalConfidence);
        explanation.put("domainPenalty", domainPenalty);
        explanation.put("matchedAttributes", matchedAttrs);
        explanation.put("conflictingAttributes", conflictingAttrs);
        explanation.put("reason", generateReasonText(matchType, matchedAttrs, conflictingAttrs, finalConfidence));

        return MaterialMatch.builder()
                .materialId(source.getId())
                .matchedMaterialId(target.getId())
                .canonicalMaterialId(canonicalId)
                .semanticScore(semanticScore)
                .lexicalScore(lexicalScore)
                .attributeScore(attributeScore)
                .finalConfidence(finalConfidence)
                .matchType(matchType)
                .status("PENDING")
                .explanation(explanation)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    public MaterialMatch computeMatchWithCanonical(Material source, MaterialAttribute sAttr, CanonicalMaterial canonical) {
        String sDesc = source.getNormalizedDescription() != null ? source.getNormalizedDescription() : source.getOriginalDescription().toLowerCase();
        String cDesc = canonical.getStandardName().toLowerCase();

        double lexicalScore = calculateLexicalSimilarity(sDesc, cDesc);
        double semanticScore = calculateSemanticSimilarity(sDesc, cDesc);

        List<String> matchedAttrs = new ArrayList<>();
        List<String> conflictingAttrs = new ArrayList<>();

        double attributeScore = 0.5; // Baseline if no direct attributes
        if (sAttr != null) {
            attributeScore = compareAttributeWithCanonical(sAttr, canonical, matchedAttrs, conflictingAttrs);
        }

        double domainPenalty = conflictingAttrs.isEmpty() ? 0.0 : 0.25;
        double rawConfidence = (semanticScore * 0.45) + (lexicalScore * 0.25) + (attributeScore * 0.30) - domainPenalty;
        double finalConfidence = Math.max(0.0, Math.min(1.0, Math.round(rawConfidence * 100.0) / 100.0));

        String matchType = classifyMatchType(finalConfidence, conflictingAttrs.isEmpty());

        Map<String, Object> explanation = new HashMap<>();
        explanation.put("semanticScore", semanticScore);
        explanation.put("lexicalScore", lexicalScore);
        explanation.put("attributeScore", attributeScore);
        explanation.put("finalConfidence", finalConfidence);
        explanation.put("matchedAttributes", matchedAttrs);
        explanation.put("conflictingAttributes", conflictingAttrs);
        explanation.put("reason", "Evaluated against canonical specification " + canonical.getCanonicalCode());

        return MaterialMatch.builder()
                .materialId(source.getId())
                .canonicalMaterialId(canonical.getId())
                .semanticScore(semanticScore)
                .lexicalScore(lexicalScore)
                .attributeScore(attributeScore)
                .finalConfidence(finalConfidence)
                .matchType(matchType)
                .status("PENDING")
                .explanation(explanation)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    public double calculateLexicalSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null || s1.isBlank() || s2.isBlank()) return 0.0;
        if (s1.equals(s2)) return 1.0;

        // Token Jaccard
        Set<String> set1 = new HashSet<>(Arrays.asList(s1.split("\\s+")));
        Set<String> set2 = new HashSet<>(Arrays.asList(s2.split("\\s+")));

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        double jaccard = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();

        // Levenshtein similarity
        int maxLen = Math.max(s1.length(), s2.length());
        int dist = LEVENSHTEIN.apply(s1, s2);
        double levSim = 1.0 - ((double) dist / maxLen);

        return Math.round(((jaccard * 0.6) + (levSim * 0.4)) * 100.0) / 100.0;
    }

    public double calculateSemanticSimilarity(String s1, String s2) {
        try {
            List<Double> emb1 = aiService.generateEmbeddings(s1);
            List<Double> emb2 = aiService.generateEmbeddings(s2);
            if (!emb1.isEmpty() && !emb2.isEmpty() && emb1.size() == emb2.size()) {
                return cosineSimilarity(emb1, emb2);
            }
        } catch (Exception e) {
            log.warn("AI embedding call unavailable, falling back to lexical-semantic approximation: {}", e.getMessage());
        }

        // Fallback approximation when ML service is offline or in local test
        return calculateLexicalSimilarity(s1, s2);
    }

    private double cosineSimilarity(List<Double> vecA, List<Double> vecB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vecA.size(); i++) {
            dotProduct += vecA.get(i) * vecB.get(i);
            normA += Math.pow(vecA.get(i), 2);
            normB += Math.pow(vecB.get(i), 2);
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        double cos = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0.0, Math.min(1.0, Math.round(cos * 100.0) / 100.0));
    }

    private double calculateAttributeSimilarity(
            MaterialAttribute a1,
            MaterialAttribute a2,
            List<String> matchedAttrs,
            List<String> conflictingAttrs) {

        if (a1 == null || a2 == null) return 0.5;

        int totalChecked = 0;
        int matched = 0;

        // Check critical engineering attributes
        matched += checkField("itemType", a1.getItemType(), a2.getItemType(), matchedAttrs, conflictingAttrs); totalChecked++;
        matched += checkField("material", a1.getMaterialName(), a2.getMaterialName(), matchedAttrs, conflictingAttrs); totalChecked++;
        matched += checkField("grade", a1.getGrade(), a2.getGrade(), matchedAttrs, conflictingAttrs); totalChecked++;
        matched += checkField("diameter", a1.getDiameter(), a2.getDiameter(), matchedAttrs, conflictingAttrs); totalChecked++;
        matched += checkField("length", a1.getLength(), a2.getLength(), matchedAttrs, conflictingAttrs); totalChecked++;
        matched += checkField("pressureClass", a1.getPressureClass(), a2.getPressureClass(), matchedAttrs, conflictingAttrs); totalChecked++;

        return totalChecked > 0 ? (double) matched / totalChecked : 0.5;
    }

    private int checkField(String fieldName, String v1, String v2, List<String> matched, List<String> conflicts) {
        if (v1 == null || v2 == null || v1.isBlank() || v2.isBlank()) {
            return 0; // Unknown
        }
        if (v1.trim().equalsIgnoreCase(v2.trim())) {
            matched.add(fieldName + ": " + v1.trim());
            return 1;
        } else {
            conflicts.add(fieldName + " mismatch: '" + v1.trim() + "' vs '" + v2.trim() + "'");
            return 0;
        }
    }

    private double compareAttributeWithCanonical(
            MaterialAttribute attr,
            CanonicalMaterial canonical,
            List<String> matched,
            List<String> conflicts) {

        String canonName = canonical.getStandardName().toLowerCase();
        int matchedCount = 0;
        int tested = 0;

        if (attr.getGrade() != null && !attr.getGrade().isBlank()) {
            tested++;
            if (canonName.contains(attr.getGrade().toLowerCase())) {
                matched.add("grade: " + attr.getGrade());
                matchedCount++;
            }
        }
        if (attr.getDiameter() != null && !attr.getDiameter().isBlank()) {
            tested++;
            if (canonName.contains(attr.getDiameter().toLowerCase())) {
                matched.add("diameter: " + attr.getDiameter());
                matchedCount++;
            }
        }
        if (attr.getLength() != null && !attr.getLength().isBlank()) {
            tested++;
            if (canonName.contains(attr.getLength().toLowerCase().replace("mm", "").trim())) {
                matched.add("length: " + attr.getLength());
                matchedCount++;
            }
        }

        return tested > 0 ? (double) matchedCount / tested : 0.6;
    }

    private String classifyMatchType(double confidence, boolean noConflicts) {
        if (confidence >= 0.90 && noConflicts) return "EXACT";
        if (confidence >= 0.75) return "POTENTIAL_EQUIVALENT";
        if (confidence >= 0.50) return "SIMILAR";
        return "NOT_MATCH";
    }

    private String generateReasonText(String matchType, List<String> matched, List<String> conflicts, double conf) {
        if (!conflicts.isEmpty()) {
            return "Potential match with conflicts: " + String.join(", ", conflicts);
        }
        if (matchType.equals("EXACT")) {
            return "Exact engineering equivalence across key specifications (" + (int)(conf * 100) + "% confidence)";
        }
        return "High similarity with matched attributes: " + String.join(", ", matched);
    }

    public List<DuplicateGroupDto> getDuplicateGroups() {
        // Group materials by canonical material id where status is APPROVED or high confidence POTENTIAL_EQUIVALENT
        List<MaterialMatch> matches = matchRepository.findHighConfidenceMatches(0.80);
        Map<Long, List<MaterialMatch>> groupedByCanonical = matches.stream()
                .filter(m -> m.getCanonicalMaterialId() != null)
                .collect(Collectors.groupingBy(MaterialMatch::getCanonicalMaterialId));

        List<DuplicateGroupDto> groups = new ArrayList<>();
        int groupCounter = 100;

        for (Map.Entry<Long, List<MaterialMatch>> entry : groupedByCanonical.entrySet()) {
            Long canonicalId = entry.getKey();
            CanonicalMaterial cm = canonicalRepository.findById(canonicalId).orElse(null);
            if (cm == null) continue;

            Set<Long> materialIds = new HashSet<>();
            for (MaterialMatch mm : entry.getValue()) {
                materialIds.add(mm.getMaterialId());
                if (mm.getMatchedMaterialId() != null) materialIds.add(mm.getMatchedMaterialId());
            }

            List<DuplicateGroupDto.DuplicateMaterialItemDto> items = new ArrayList<>();
            for (Long mId : materialIds) {
                Material m = materialRepository.findById(mId).orElse(null);
                if (m != null) {
                    Cpse cpse = cpseRepository.findById(m.getCpseId()).orElse(null);
                    items.add(DuplicateGroupDto.DuplicateMaterialItemDto.builder()
                            .materialId(m.getId())
                            .materialCode(m.getOriginalMaterialCode())
                            .cpseCode(cpse != null ? cpse.getCode() : "UNKNOWN")
                            .cpseName(cpse != null ? cpse.getName() : "Unknown CPSE")
                            .originalDescription(m.getOriginalDescription())
                            .normalizedDescription(m.getNormalizedDescription())
                            .status(m.getStatus())
                            .build());
                }
            }

            if (items.size() >= 2) {
                groups.add(DuplicateGroupDto.builder()
                        .groupId("DUP-" + String.format("%06d", groupCounter++))
                        .standardName(cm.getStandardName())
                        .canonicalCode(cm.getCanonicalCode())
                        .confidence(entry.getValue().get(0).getFinalConfidence())
                        .items(items)
                        .build());
            }
        }

        return groups;
    }

    public HarmonizationResultResponse toResponse(MaterialMatch mm) {
        Material source = materialRepository.findById(mm.getMaterialId()).orElse(null);
        Material matched = mm.getMatchedMaterialId() != null ?
                materialRepository.findById(mm.getMatchedMaterialId()).orElse(null) : null;
        CanonicalMaterial canonical = mm.getCanonicalMaterialId() != null ?
                canonicalRepository.findById(mm.getCanonicalMaterialId()).orElse(null) : null;

        String cpseCode = null;
        if (source != null) {
            cpseCode = cpseRepository.findById(source.getCpseId()).map(Cpse::getCode).orElse(null);
        }
        String matchedCpseCode = null;
        if (matched != null) {
            matchedCpseCode = cpseRepository.findById(matched.getCpseId()).map(Cpse::getCode).orElse(null);
        }

        return HarmonizationResultResponse.builder()
                .id(mm.getId())
                .materialId(mm.getMaterialId())
                .materialCode(source != null ? source.getOriginalMaterialCode() : null)
                .materialDescription(source != null ? source.getOriginalDescription() : null)
                .cpseCode(cpseCode)
                .matchedMaterialId(mm.getMatchedMaterialId())
                .matchedMaterialCode(matched != null ? matched.getOriginalMaterialCode() : null)
                .matchedMaterialDescription(matched != null ? matched.getOriginalDescription() : null)
                .matchedCpseCode(matchedCpseCode)
                .canonicalMaterialId(mm.getCanonicalMaterialId())
                .canonicalCode(canonical != null ? canonical.getCanonicalCode() : null)
                .canonicalStandardName(canonical != null ? canonical.getStandardName() : null)
                .semanticScore(mm.getSemanticScore())
                .lexicalScore(mm.getLexicalScore())
                .attributeScore(mm.getAttributeScore())
                .finalConfidence(mm.getFinalConfidence())
                .matchType(mm.getMatchType())
                .status(mm.getStatus())
                .explanation(mm.getExplanation())
                .createdAt(mm.getCreatedAt())
                .updatedAt(mm.getUpdatedAt())
                .build();
    }
}
