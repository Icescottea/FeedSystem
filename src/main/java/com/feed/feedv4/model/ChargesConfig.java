package com.feed.feedv4.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChargesConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private String serviceType; // e.g., FORMULATION, PELLETING
    private double rate;
    private boolean percentage;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public double getRate() { return rate; }
    public void setRate(double rate) { this.rate = rate; }

    public boolean isPercentage() { return percentage; }
    public void setPercentage(boolean percentage) { this.percentage = percentage; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
