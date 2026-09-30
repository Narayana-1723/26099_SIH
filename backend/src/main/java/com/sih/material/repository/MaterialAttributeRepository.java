package com.sih.material.repository;

import com.sih.material.entity.MaterialAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface MaterialAttributeRepository extends JpaRepository<MaterialAttribute, Long> {

    Optional<MaterialAttribute> findByMaterialId(Long materialId);

    List<MaterialAttribute> findByCategory(String category);

    @Query("SELECT ma.category AS category, COUNT(ma) AS count FROM MaterialAttribute ma WHERE ma.category IS NOT NULL GROUP BY ma.category")
    List<Map<String, Object>> countGroupByCategory();
}
