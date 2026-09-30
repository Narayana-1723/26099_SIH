package com.sih.material.repository;

import com.sih.material.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long>, JpaSpecificationExecutor<Material> {

    Optional<Material> findByCpseIdAndOriginalMaterialCode(Long cpseId, String originalMaterialCode);

    List<Material> findByCpseId(Long cpseId);

    Page<Material> findByCpseId(Long cpseId, Pageable pageable);

    Page<Material> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);

    long countByCpseId(Long cpseId);

    @Query("SELECT COUNT(m) FROM Material m WHERE m.status != 'HARMONIZED'")
    long countUnmappedMaterials();

    @Query("SELECT m.status AS status, COUNT(m) AS count FROM Material m GROUP BY m.status")
    List<Map<String, Object>> countGroupByStatus();

    @Query("SELECT m.cpseId AS cpseId, COUNT(m) AS count FROM Material m GROUP BY m.cpseId")
    List<Map<String, Object>> countGroupByCpseId();

    @Query("SELECT m FROM Material m WHERE " +
           "LOWER(m.originalMaterialCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.originalDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(m.normalizedDescription IS NOT NULL AND LOWER(m.normalizedDescription) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Material> searchMaterials(@Param("query") String query, Pageable pageable);
}
