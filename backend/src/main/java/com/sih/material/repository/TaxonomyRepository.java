package com.sih.material.repository;

import com.sih.material.entity.Taxonomy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaxonomyRepository extends JpaRepository<Taxonomy, Long> {

    Optional<Taxonomy> findByCode(String code);

    boolean existsByCode(String code);

    List<Taxonomy> findByParentIdIsNullAndActiveTrue();

    List<Taxonomy> findByParentIdAndActiveTrue(Long parentId);

    List<Taxonomy> findByLevelAndActiveTrue(Integer level);

    List<Taxonomy> findAllByActiveTrue();
}
