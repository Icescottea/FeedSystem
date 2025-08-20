package com.feed.feedv4.repository;

import com.feed.feedv4.model.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    List<InventoryMovement> findByRawMaterialIdOrderByMovementDateDesc(Long rawMaterialId);

    List<InventoryMovement> findByRawMaterialIdAndMovementDateBetweenOrderByMovementDateDesc(
            Long rawMaterialId, LocalDateTime start, LocalDateTime end);
}
