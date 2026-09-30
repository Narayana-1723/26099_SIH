package com.sih.material.repository;

import com.sih.material.entity.CanonicalMaterial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CanonicalMaterialRepository extends JpaRepository<CanonicalMaterial, Long> {

    Optional<CanonicalMaterial> findByCanonicalCode(String canonicalCode);

    boolean existsByCanonicalCode(String canonicalCode);

    List<CanonicalMaterial> findByCategory(String category);

    Page<CanonicalMaterial> findByStatus(String status, Pageable pageable);

    @Query("SELECT cm FROM CanonicalMaterial cm WHERE " +
           "LOWER(cm.canonicalCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(cm.standardName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(cm.category IS NOT NULL AND LOWER(cm.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<CanonicalMaterial> searchCanonical(@Param("query") String query, Pageable pageable);
}
