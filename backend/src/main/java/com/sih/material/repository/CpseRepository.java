package com.sih.material.repository;

import com.sih.material.entity.Cpse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CpseRepository extends JpaRepository<Cpse, Long> {
    Optional<Cpse> findByCode(String code);
    Optional<Cpse> findByName(String name);
    boolean existsByCode(String code);
    List<Cpse> findAllByActiveTrue();
}
