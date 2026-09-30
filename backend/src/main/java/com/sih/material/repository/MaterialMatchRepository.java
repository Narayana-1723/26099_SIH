package com.sih.material.repository;

import com.sih.material.entity.MaterialMatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface MaterialMatchRepository extends JpaRepository<MaterialMatch, Long> {

    List<MaterialMatch> findByMaterialId(Long materialId);

    List<MaterialMatch> findByMatchedMaterialId(Long matchedMaterialId);

    List<MaterialMatch> findByCanonicalMaterialId(Long canonicalMaterialId);

    Page<MaterialMatch> findByStatus(String status, Pageable pageable);

    Page<MaterialMatch> findByMatchType(String matchType, Pageable pageable);

    Optional<MaterialMatch> findByMaterialIdAndMatchedMaterialId(Long materialId, Long matchedMaterialId);

    Optional<MaterialMatch> findByMaterialIdAndCanonicalMaterialId(Long materialId, Long canonicalMaterialId);

    long countByStatus(String status);

    @Query("SELECT COUNT(m) FROM MaterialMatch m WHERE m.status = 'PENDING'")
    long countPendingReviews();

    @Query("SELECT COUNT(DISTINCT m.materialId) FROM MaterialMatch m WHERE m.matchType IN ('EXACT', 'POTENTIAL_EQUIVALENT')")
    long countPotentialDuplicates();

    @Query("SELECT m.matchType AS matchType, COUNT(m) AS count FROM MaterialMatch m GROUP BY m.matchType")
    List<Map<String, Object>> countGroupByMatchType();

    @Query("SELECT AVG(m.finalConfidence) FROM MaterialMatch m")
    Double getAverageConfidence();

    @Query("SELECT m FROM MaterialMatch m WHERE m.finalConfidence >= :minConfidence ORDER BY m.finalConfidence DESC")
    List<MaterialMatch> findHighConfidenceMatches(@Param("minConfidence") Double minConfidence);
}
