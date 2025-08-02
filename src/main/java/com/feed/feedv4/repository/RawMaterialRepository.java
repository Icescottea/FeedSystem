package com.feed.feedv4.repository;
import java.util.Optional;

import com.feed.feedv4.model.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    List<RawMaterial> findByArchivedFalse();
    Optional<RawMaterial> findByNameAndBatchId(String name, String batchId);
    List<RawMaterial> findByInStockKgLessThanEqual(double threshold);

    @Query("SELECT r FROM RawMaterial r WHERE r.inStockKg <= :threshold AND r.archived = false")
    List<RawMaterial> findLowStock(Double threshold);

    @Query("SELECT r FROM RawMaterial r WHERE r.expiryDate <= :cutoff AND r.archived = false")
    List<RawMaterial> findExpiringWithinDays(LocalDate cutoff);

    @Query("SELECT r FROM RawMaterial r WHERE r.inStockKg > :minStock AND r.archived = false")
    List<RawMaterial> findByInStockKgGreaterThanAndArchivedFalse(double minStock);
    
}
