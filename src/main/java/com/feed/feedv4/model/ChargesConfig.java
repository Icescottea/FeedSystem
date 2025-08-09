package com.feed.feedv4.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChargesConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;

    // "per_batch" or "per_kg"
    private String formulationFeeType;
    private double formulationFee;

    // "fixed" (treat as ₹/kg) or "percentage"
    private String pelletingFeeType;
    private double pelletingFee;

    private double rmMarkupPercent;

    private LocalDateTime lastUpdated;

    // % of product value
    private double systemFeePercent;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }

    // ---- Getters / Setters ----

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getFormulationFeeType() {
        return formulationFeeType;
    }

    public void setFormulationFeeType(String formulationFeeType) {
        this.formulationFeeType = formulationFeeType;
    }

    public double getFormulationFee() {
        return formulationFee;
    }

    public void setFormulationFee(double formulationFee) {
        this.formulationFee = formulationFee;
    }

    public String getPelletingFeeType() {
        return pelletingFeeType;
    }

    public void setPelletingFeeType(String pelletingFeeType) {
        this.pelletingFeeType = pelletingFeeType;
    }

    public double getPelletingFee() {
        return pelletingFee;
    }

    public void setPelletingFee(double pelletingFee) {
        this.pelletingFee = pelletingFee;
    }

    public double getRmMarkupPercent() {
        return rmMarkupPercent;
    }

    public void setRmMarkupPercent(double rmMarkupPercent) {
        this.rmMarkupPercent = rmMarkupPercent;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public double getSystemFeePercent() {
        return systemFeePercent;
    }

    public void setSystemFeePercent(double systemFeePercent) {
        this.systemFeePercent = systemFeePercent;
    }
}
