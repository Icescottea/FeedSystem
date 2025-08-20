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

    public WacmService(RawMaterialRepository rawMaterialRepo,
                       InventoryMovementRepository movementRepo) {
        this.rawMaterialRepo = rawMaterialRepo;
        this.movementRepo = movementRepo;
    }

    private double nz(Double v) { return v == null ? 0.0 : v; }

    /** RECEIVE: add stock and recompute WAC. */
    @Transactional
    public RawMaterial receiveStock(Long rawMaterialId, double quantity, double unitCost, String reference) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        if (unitCost <= 0) throw new IllegalArgumentException("Unit cost must be > 0");
    
        RawMaterial rm = rawMaterialRepo.findByIdForUpdate(rawMaterialId)
                .orElseThrow(() -> new RuntimeException("Raw material not found"));
    
        double oldQty   = rm.getInStockKg() == null ? 0.0 : rm.getInStockKg();
        double oldWac   = rm.getWeightedAvgCost();                      // getter already null-guards to 0.0
        double oldValue = rm.getTotalValue();                           // getter already null-guards to 0.0
    
        // if first time, derive oldValue from costPerKg if set
        if (oldQty > 0 && oldValue == 0.0 && oldWac == 0.0 && rm.getCostPerKg() != null) {
            oldWac = rm.getCostPerKg();
            oldValue = oldQty * oldWac;
        }
    
        double inValue = quantity * unitCost;
    
        double newQty   = oldQty + quantity;
        double newValue = oldValue + inValue;
        double newWac   = newQty == 0 ? 0.0 : newValue / newQty;
    
        // 🔑 update ALL three
        rm.setInStockKg(newQty);
        rm.setWeightedAvgCost(newWac);
        rm.setTotalValue(newValue);
        rm.setCostPerKg(newWac);         // keep legacy UI in sync
        rawMaterialRepo.save(rm);
    
        InventoryMovement mv = new InventoryMovement();
        mv.setRawMaterial(rm);
        mv.setMovementDate(java.time.LocalDateTime.now());
        mv.setMovementType(MovementType.RECEIVE);
        mv.setQuantity(quantity);
        mv.setUnitCost(newWac);          // WAC at time of movement
        mv.setTotalCost(quantity * newWac);
        mv.setReference(reference);
        movementRepo.save(mv);
    
        return rm;
    }
    
    @Transactional
    public RawMaterial issueStock(Long rawMaterialId, double quantity, String reference) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be > 0");
    
        RawMaterial rm = rawMaterialRepo.findByIdForUpdate(rawMaterialId)
                .orElseThrow(() -> new RuntimeException("Raw material not found"));
    
        double stock    = rm.getInStockKg() == null ? 0.0 : rm.getInStockKg();
        if (stock < quantity) throw new RuntimeException("Insufficient stock for " + rm.getName());
    
        double wac      = rm.getWeightedAvgCost(); // 0-safe
        double outValue = quantity * wac;
    
        double newQty   = stock - quantity;
        double newValue = Math.max(0.0, rm.getTotalValue() - outValue);
        double newWac   = newQty == 0 ? 0.0 : newValue / newQty;
    
        // 🔑 keep totals consistent
        rm.setInStockKg(newQty);
        rm.setTotalValue(newValue);
        rm.setWeightedAvgCost(newWac);
        rm.setCostPerKg(newWac);
        rawMaterialRepo.save(rm);
    
        InventoryMovement mv = new InventoryMovement();
        mv.setRawMaterial(rm);
        mv.setMovementDate(java.time.LocalDateTime.now());
        mv.setMovementType(MovementType.ISSUE);
        mv.setQuantity(quantity);
        mv.setUnitCost(wac);
        mv.setTotalCost(outValue);
        mv.setReference(reference);
        movementRepo.save(mv);
    
        return rm;
    }

}
