package com.feed.feedv4.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChargesConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId; 
    private String formulationFeeType; // "per_batch" or "per_kg"
    private double formulationFee;

    private String pelletingFeeType; // "fixed" or "percentage"
    private double pelletingFee;

    private double rmMarkupPercent;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }

    public void setId(Long id) {
        this.id = id;
    }
    public Long getId() {
        return id;
    }

    // Getters and Setters
}
