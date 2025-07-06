package com.feed.feedv4.repository;
import java.util.Optional;

import com.feed.feedv4.model.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    List<RawMaterial> findByArchivedFalse();
    Optional<RawMaterial> findByNameAndBatchId(String name, String batchId);
    List<RawMaterial> findByInStockKgLessThanEqual(double threshold);
}
