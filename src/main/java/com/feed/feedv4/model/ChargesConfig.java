package com.feed.feedv4.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChargesConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;

    @Column(name = "formulation_fee_type")  // "per_batch" or "per_kg"
    private String formulationFeeType;

    @Column(name = "formulation_fee", nullable = false)
    private Double formulationFee = 0.0;

    @Column(name = "pelleting_fee_type")    // "fixed", "per_kg", or "percentage"
    private String pelletingFeeType;

    @Column(name = "pelleting_fee", nullable = false)
    private Double pelletingFee = 0.0;

    @Column(name = "rm_markup_percent", nullable = false)
    private Double rmMarkupPercent = 0.0;

    @Column(name = "system_fee_percent", nullable = false)
    private Double systemFeePercent = 0.0;

    private Boolean active = true;

    private LocalDateTime lastUpdated;

    @Column(name = "service_type")
    private String serviceType;

    @Column(name = "percentage")
    private Double percentage = 0.0;

    @Column(name = "rate")
    private Double rate = 0.0;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getFormulationFeeType() { return formulationFeeType; }
    public void setFormulationFeeType(String formulationFeeType) { this.formulationFeeType = formulationFeeType; }

    public Double getFormulationFee() { return formulationFee; }
    public void setFormulationFee(Double formulationFee) { this.formulationFee = formulationFee; }

    public String getPelletingFeeType() { return pelletingFeeType; }
    public void setPelletingFeeType(String pelletingFeeType) { this.pelletingFeeType = pelletingFeeType; }

    public Double getPelletingFee() { return pelletingFee; }
    public void setPelletingFee(Double pelletingFee) { this.pelletingFee = pelletingFee; }

    public Double getRmMarkupPercent() { return rmMarkupPercent; }
    public void setRmMarkupPercent(Double rmMarkupPercent) { this.rmMarkupPercent = rmMarkupPercent; }

    public Double getSystemFeePercent() { return systemFeePercent; }
    public void setSystemFeePercent(Double systemFeePercent) { this.systemFeePercent = systemFeePercent; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }
}
