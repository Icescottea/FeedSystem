package com.feed.feedv4.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "charges_config")
public class ChargesConfig {

    public enum FeeBasis {
        PER_KG, PER_BATCH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---- Fees ----
    @Enumerated(EnumType.STRING)
    @Column(name = "pelleting_fee_type", nullable = false, length = 20)
    private FeeBasis pelletingFeeType = FeeBasis.PER_KG;

    @Column(name = "pelleting_fee", nullable = false)
    private Double pelletingFee = 0.0;            // ₹/kg or ₹ per batch

    @Enumerated(EnumType.STRING)
    @Column(name = "formulation_fee_type", nullable = false, length = 20)
    private FeeBasis formulationFeeType = FeeBasis.PER_KG;

    @Column(name = "formulation_fee", nullable = false)
    private Double formulationFee = 0.0;          // ₹/kg or ₹ per batch

    @Column(name = "system_fee_percent", nullable = false)
    private Double systemFeePercent = 0.0;        // 0..100

    // ---- Meta ----
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void touchTimestamp() {
        this.lastUpdated = LocalDateTime.now();
        if (pelletingFee == null) pelletingFee = 0.0;
        if (formulationFee == null) formulationFee = 0.0;
        if (systemFeePercent == null) systemFeePercent = 0.0;
        if (pelletingFeeType == null) pelletingFeeType = FeeBasis.PER_KG;
        if (formulationFeeType == null) formulationFeeType = FeeBasis.PER_KG;
        if (active == null) active = true;
    }

    // ---- Getters / Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FeeBasis getPelletingFeeType() { return pelletingFeeType; }
    public void setPelletingFeeType(FeeBasis pelletingFeeType) { this.pelletingFeeType = pelletingFeeType; }

    public Double getPelletingFee() { return pelletingFee; }
    public void setPelletingFee(Double pelletingFee) { this.pelletingFee = pelletingFee; }

    public FeeBasis getFormulationFeeType() { return formulationFeeType; }
    public void setFormulationFeeType(FeeBasis formulationFeeType) { this.formulationFeeType = formulationFeeType; }

    public Double getFormulationFee() { return formulationFee; }
    public void setFormulationFee(Double formulationFee) { this.formulationFee = formulationFee; }

    public Double getSystemFeePercent() { return systemFeePercent; }
    public void setSystemFeePercent(Double systemFeePercent) { this.systemFeePercent = systemFeePercent; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
