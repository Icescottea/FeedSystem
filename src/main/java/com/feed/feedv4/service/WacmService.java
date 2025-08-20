package com.feed.feedv4.service;

import com.feed.feedv4.model.InventoryMovement;
import com.feed.feedv4.model.MovementType;
import com.feed.feedv4.model.RawMaterial;
import com.feed.feedv4.repository.InventoryMovementRepository;
import com.feed.feedv4.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class WacmService {

    private final RawMaterialRepository rawMaterialRepo;
    private final InventoryMovementRepository movementRepo;

    public WacmService(RawMaterialRepository rawMaterialRepo, InventoryMovementRepository movementRepo) {
        this.rawMaterialRepo = rawMaterialRepo;
        this.movementRepo = movementRepo;
    }

    /**
     * Receive new stock and recalc Weighted Avg Cost per unit
     */
    @Transactional
    public RawMaterial receiveStock(Long rawMaterialId, double quantity, double unitCost) {
        RawMaterial rm = rawMaterialRepo.findByIdForUpdate(rawMaterialId)
                .orElseThrow(() -> new RuntimeException("Raw material not found"));

        double oldQty = rm.getInStockKg();
        double oldValue = oldQty * rm.getCostPerKg();

        double newValue = quantity * unitCost;

        double totalQty = oldQty + quantity;
        double totalValue = oldValue + newValue;

        double newAvgCost = totalQty == 0 ? 0 : totalValue / totalQty;

        rm.setInStockKg(totalQty);
        rm.setCostPerKg(newAvgCost);
        rawMaterialRepo.save(rm);

        // log movement
        InventoryMovement movement = new InventoryMovement();
        movement.setRawMaterial(rm);
        movement.setMovementType(MovementType.RECEIVE);
        movement.setQuantity(quantity);
        movement.setUnitCost(unitCost);
        movement.setTotalCost(newValue);
        movement.setMovementDate(LocalDateTime.now());
        movementRepo.save(movement);

        return rm;
    }

    /**
     * Issue stock using current WAC
     */
    @Transactional
    public RawMaterial issueStock(Long rawMaterialId, double quantity) {
        RawMaterial rm = rawMaterialRepo.findByIdForUpdate(rawMaterialId)
                .orElseThrow(() -> new RuntimeException("Raw material not found"));

        if (rm.getInStockKg() < quantity) {
            throw new RuntimeException("Insufficient stock for " + rm.getName());
        }

        double unitCost = rm.getCostPerKg();
        double totalCost = quantity * unitCost;

        rm.setInStockKg(rm.getInStockKg() - quantity);
        rawMaterialRepo.save(rm);

        // log movement
        InventoryMovement movement = new InventoryMovement();
        movement.setRawMaterial(rm);
        movement.setMovementType(MovementType.ISSUE);
        movement.setQuantity(quantity);
        movement.setUnitCost(unitCost);
        movement.setTotalCost(totalCost);
        movement.setMovementDate(LocalDateTime.now());
        movementRepo.save(movement);

        return rm;
    }
}
