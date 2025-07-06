package com.feed.feedv4.repository;

import com.feed.feedv4.model.PelletingBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PelletingBatchRepository extends JpaRepository<PelletingBatch, Long> {
    List<PelletingBatch> findByOperatorId(Long operatorId);
    List<PelletingBatch> findByStatus(String status);
}
