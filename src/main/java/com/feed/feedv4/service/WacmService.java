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

    /**
     * RECEIVE: add stock and recompute Weighted Average Cost (WAC).
     * @param rawMaterialId material id
     * @param quantity      received qty (kg) > 0
     * @param purchaseUnitCost purchase unit cost (Rs/kg) > 0
     * @param reference     optional ref (e.g., "PO-123")
     */
    @Transactional
    public RawMaterial receiveStock(Long rawMaterialId, double quantity, double purchaseUnitCost, String reference) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        if (purchaseUnitCost <= 0) throw new IllegalArgumentException("Unit cost must be > 0");

        RawMaterial rm = rawMaterialRepo.findByIdForUpdate(rawMaterialId)
                .orElseThrow(() -> new RuntimeException("Raw material not found"));

        double oldQty  = nz(rm.getInStockKg());
        double oldWac  = nz(rm.getCostPerKg()); // we store WAC here
        double oldVal  = oldQty * oldWac;

        double inVal   = quantity * purchaseUnitCost;

        double newQty  = oldQty + quantity;
        double newVal  = oldVal + inVal;
        double newWac  = newQty == 0 ? 0.0 : (newVal / newQty);

        // Update material with new WAC and qty
        rm.setInStockKg(newQty);
        rm.setCostPerKg(newWac);
        rawMaterialRepo.save(rm);

        // Log movement: unitCost = WAC at time of movement, totalCost = qty * WAC
        InventoryMovement mv = new InventoryMovement();
        mv.setRawMaterial(rm);
        mv.setMovementDate(LocalDateTime.now());
        mv.setMovementType(MovementType.RECEIVE);
        mv.setQuantity(quantity);
        mv.setUnitCost(newWac);                 // WAC at time of movement
        mv.setTotalCost(quantity * newWac);
        mv.setReference(reference);
        movementRepo.save(mv);

        return rm;
    }

    /** Overload without reference string. */
    @Transactional
    public RawMaterial receiveStock(Long rawMaterialId, double quantity, double purchaseUnitCost) {
        return receiveStock(rawMaterialId, quantity, purchaseUnitCost, null);
    }

    /**
     * DISPATCH: issue stock valued at current WAC.
     * @param rawMaterialId material id
     * @param quantity      dispatch qty (kg) > 0 and <= stock
     * @param reference     optional ref (e.g., "Formulation #12")
     */
    @Transactional
    public RawMaterial issueStock(Long rawMaterialId, double quantity, String reference) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be > 0");

        RawMaterial rm = rawMaterialRepo.findByIdForUpdate(rawMaterialId)
                .orElseThrow(() -> new RuntimeException("Raw material not found"));

        double stock = nz(rm.getInStockKg());
        if (stock < quantity) {
            throw new RuntimeException("Insufficient stock for " + rm.getName());
        }

        double currentWac = nz(rm.getCostPerKg());
        double outVal     = quantity * currentWac;

        // Update material qty (WAC unchanged on dispatch)
        rm.setInStockKg(stock - quantity);
        rawMaterialRepo.save(rm);

        // Log movement: unitCost = WAC at time of movement, totalCost = qty * WAC
        InventoryMovement mv = new InventoryMovement();
        mv.setRawMaterial(rm);
        mv.setMovementDate(LocalDateTime.now());
        mv.setMovementType(MovementType.ISSUE);
        mv.setQuantity(quantity);
        mv.setUnitCost(currentWac);             // WAC at time of movement
        mv.setTotalCost(outVal);
        mv.setReference(reference);
        movementRepo.save(mv);

        return rm;
    }

    /** Overload without reference string. */
    @Transactional
    public RawMaterial issueStock(Long rawMaterialId, double quantity) {
        return issueStock(rawMaterialId, quantity, null);
    }
}
