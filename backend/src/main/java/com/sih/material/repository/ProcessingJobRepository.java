package com.sih.material.repository;

import com.sih.material.entity.ProcessingJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProcessingJobRepository extends JpaRepository<ProcessingJob, Long> {

    Optional<ProcessingJob> findByJobCode(String jobCode);

    Page<ProcessingJob> findByStatus(String status, Pageable pageable);

    Page<ProcessingJob> findByCpseId(Long cpseId, Pageable pageable);
}
