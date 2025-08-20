package com.feed.feedv4.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
public class RawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private Double costPerKg;
    private Double inStockKg;
    private LocalDate expiryDate;
    private String supplier;
    private String batchId;
    private String qualityGrade;
    private boolean locked;
    private Double cp;
    private Double me;
    private Double calcium;
    private Double fat;
    private Double fiber;
    private Double ash;
    private boolean archived;

    // WACM fields
    private Double weightedAvgCost;
    private Double totalValue;

    @PrePersist
    public void prePersist() {
        if (weightedAvgCost == null) weightedAvgCost = 0.0;
        if (totalValue == null) totalValue = 0.0;
    }

    @PreUpdate
    public void preUpdate() {
        if (weightedAvgCost == null) weightedAvgCost = 0.0;
        if (totalValue == null) totalValue = 0.0;
    }

    // === Getters and Setters ===

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getCostPerKg() { return costPerKg; }
    public void setCostPerKg(Double costPerKg) { this.costPerKg = costPerKg; }

    public Double getInStockKg() { return inStockKg; }
    public void setInStockKg(Double inStockKg) { this.inStockKg = inStockKg; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }

    public Double getCp() { return cp; }
    public void setCp(Double cp) { this.cp = cp; }

    public Double getMe() { return me; }
    public void setMe(Double me) { this.me = me; }

    public Double getCalcium() { return calcium; }
    public void setCalcium(Double calcium) { this.calcium = calcium; }

    public Double getFat() { return fat; }
    public void setFat(Double fat) { this.fat = fat; }

    public Double getFiber() { return fiber; }
    public void setFiber(Double fiber) { this.fiber = fiber; }

    public Double getAsh() { return ash; }
    public void setAsh(Double ash) { this.ash = ash; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public double getWeightedAvgCost() { return weightedAvgCost == null ? 0.0 : weightedAvgCost; } 
    public void setWeightedAvgCost(Double weightedAvgCost) { this.weightedAvgCost = weightedAvgCost; }

    public double getTotalValue() { return totalValue == null ? 0.0 : totalValue; }
    public void setTotalValue(Double totalValue) { this.totalValue = totalValue; }
    
}
