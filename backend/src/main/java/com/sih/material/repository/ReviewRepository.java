package com.sih.material.repository;

import com.sih.material.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByMaterialMatchId(Long materialMatchId);

    Page<Review> findByReviewerId(Long reviewerId, Pageable pageable);

    Page<Review> findByDecision(String decision, Pageable pageable);

    long countByDecision(String decision);

    @Query("SELECT r.decision AS decision, COUNT(r) AS count FROM Review r GROUP BY r.decision")
    List<Map<String, Object>> countGroupByDecision();

    @Query("SELECT r.reviewerId AS reviewerId, COUNT(r) AS count FROM Review r GROUP BY r.reviewerId")
    List<Map<String, Object>> countGroupByReviewer();
}
