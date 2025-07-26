package com.feed.feedv4.repository;

import com.feed.feedv4.model.Formulation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormulationRepository extends JpaRepository<Formulation, Long> {
    List<Formulation> findByFeedProfileId(Long feedProfileId);
    List<Formulation> findByTagsContaining(String tag);
    int countByCreatedAtAfter(java.time.LocalDateTime date);
    List<Formulation> findByStatusNot(String status); // To exclude archived
}
