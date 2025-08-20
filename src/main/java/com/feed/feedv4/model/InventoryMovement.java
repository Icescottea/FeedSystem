package com.feed.feedv4.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory_movement")
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial rawMaterial;

    private LocalDateTime movementDate;

    @Enumerated(EnumType.STRING)
    private MovementType type;  // RECEIVE or DISPATCH

    private Double quantity;        // Qty in kg
    private Double unitCost;        // Weighted Avg cost at time of movement
    private Double totalCost;      // Quantity * unitCost

    private String reference;       // Optional (e.g., "Formulation #12")

    // getters and setters

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public RawMaterial getRawMaterial() {return rawMaterial;}
    public void setRawMaterial(RawMaterial rawMaterial) {this.rawMaterial = rawMaterial;}

    public LocalDateTime getMovementDate() {return movementDate;}
    public void setMovementDate(LocalDateTime movementDate) {this.movementDate = movementDate;}

    public MovementType getMovementType() {return type;}
    public void setMovementType(MovementType type) {this.type = type;}

    public Double getQuantity() {return quantity;}
    public void setQuantity(Double quantity) {this.quantity = quantity;}

    public Double getUnitCost() {return unitCost;}
    public void setUnitCost(Double unitCost) {this.unitCost = unitCost;}

    public Double getTotalCost() {return totalCost;}
    public void setTotalCost(Double totalCost) {this.totalCost = totalCost;}

    public String getReference() {return reference;}
    public void setReference(String reference) {this.reference = reference;}    

}
