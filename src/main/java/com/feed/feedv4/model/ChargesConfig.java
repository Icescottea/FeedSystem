package com.feed.feedv4.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "charges_config")
public class ChargesConfig {

    public enum FeeBasis { PER_KG, PER_BATCH }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---- Identity & meta ----
    @Column(name = "name", nullable = false, length = 100)
    private String name;                      // e.g. "Default 2025", "Promo A"

    @Column(name = "description")
    private String description;               // optional notes

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "archived", nullable = false)
    private Boolean archived = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ---- Fees ----
    @Enumerated(EnumType.STRING)
    @Column(name = "pelleting_fee_type", nullable = false, length = 20)
    private FeeBasis pelletingFeeType = FeeBasis.PER_KG;

    @Column(name = "pelleting_fee", nullable = false)
    private Double pelletingFee = 0.0;        // ₹/kg or ₹ per batch

    @Enumerated(EnumType.STRING)
    @Column(name = "formulation_fee_type", nullable = false, length = 20)
    private FeeBasis formulationFeeType = FeeBasis.PER_KG;

    @Column(name = "formulation_fee", nullable = false)
    private Double formulationFee = 0.0;      // ₹/kg or ₹ per batch

    @Column(name = "system_fee_percent", nullable = false)
    private Double systemFeePercent = 0.0;    // 0..100

    // ---- Lifecycle hooks ----
    @PrePersist
    public void _prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        _sanitize();
    }

    @PreUpdate
    public void _preUpdate() {
        updatedAt = LocalDateTime.now();
        _sanitize();
    }

    private void _sanitize() {
        if (pelletingFee == null) pelletingFee = 0.0;
        if (formulationFee == null) formulationFee = 0.0;
        if (systemFeePercent == null) systemFeePercent = 0.0;
        if (pelletingFeeType == null) pelletingFeeType = FeeBasis.PER_KG;
        if (formulationFeeType == null) formulationFeeType = FeeBasis.PER_KG;
        if (active == null) active = true;
        if (archived == null) archived = false;
    }

    // ---- Getters/Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = (name != null ? name.trim() : null); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Boolean getArchived() { return archived; }
    public void setArchived(Boolean archived) { this.archived = archived; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

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
}
