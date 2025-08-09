package com.feed.feedv4.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String factory;
    private double batchSize;
    private String strategy;
    private String status; // Draft, Finalized, Archived
    private String version;
    private String notes;
    private double costPerKg;
    private boolean locked;
    private boolean finalized;
    private Long customerId;

    @ElementCollection
    private List<String> tags;

    @ManyToOne
    private FeedProfile feedProfile;

    @OneToMany(mappedBy = "formulation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormulationIngredient> ingredients;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Custom accessors (already provided in your code but kept here for clarity)
    public boolean isFinalized() {
        return finalized;
    }

    public void setFinalized(boolean finalized) {
        this.finalized = finalized;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getCustomerId() { 
        return customerId; 
    }

    public void setCustomerId(Long customerId) { 
        this.customerId = customerId; 
    }

}
