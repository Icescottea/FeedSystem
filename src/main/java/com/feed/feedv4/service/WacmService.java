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

        double oldQty  = nz(rm.getInStockKg());
        double oldWac  = nz(rm.getCostPerKg());             // we store WAC here
        double oldVal  = oldQty * oldWac;

        double inVal   = quantity * unitCost;

        double newQty  = oldQty + quantity;
        double newVal  = oldVal + inVal;
        double newWac  = newQty == 0 ? 0.0 : (newVal / newQty);

        rm.setInStockKg(newQty);
        rm.setCostPerKg(newWac);                            // <- THIS is the WAC you display
        rawMaterialRepo.save(rm);

        InventoryMovement mv = new InventoryMovement();
        mv.setRawMaterial(rm);
        mv.setMovementDate(LocalDateTime.now());
        mv.setMovementType(MovementType.RECEIVE);
        mv.setQuantity(quantity);
        mv.setUnitCost(newWac);                             // WAC at movement time
        mv.setTotalCost(quantity * newWac);
        mv.setReference(reference);
        movementRepo.save(mv);

        return rm;
    }

    @Transactional
    public RawMaterial receiveStock(Long rawMaterialId, double quantity, double unitCost) {
        return receiveStock(rawMaterialId, quantity, unitCost, null);
    }

    /** DISPATCH: auto-issue (used by formulation/pelleting), valued at current WAC. */
    @Transactional
    public RawMaterial issueStock(Long rawMaterialId, double quantity, String reference) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be > 0");

        RawMaterial rm = rawMaterialRepo.findByIdForUpdate(rawMaterialId)
                .orElseThrow(() -> new RuntimeException("Raw material not found"));

        double stock = nz(rm.getInStockKg());
        if (stock < quantity) throw new RuntimeException("Insufficient stock for " + rm.getName());

        double currentWac = nz(rm.getCostPerKg());
        double outVal     = quantity * currentWac;

        rm.setInStockKg(stock - quantity);
        // WAC unchanged on dispatch
        rawMaterialRepo.save(rm);

        InventoryMovement mv = new InventoryMovement();
        mv.setRawMaterial(rm);
        mv.setMovementDate(LocalDateTime.now());
        mv.setMovementType(MovementType.ISSUE);
        mv.setQuantity(quantity);
        mv.setUnitCost(currentWac);                         // WAC at time of movement
        mv.setTotalCost(outVal);
        mv.setReference(reference);
        movementRepo.save(mv);

        return rm;
    }

    @Transactional
    public RawMaterial issueStock(Long rawMaterialId, double quantity) {
        return issueStock(rawMaterialId, quantity, null);
    }
}
