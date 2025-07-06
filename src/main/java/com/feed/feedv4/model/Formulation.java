package com.feed.feedv4.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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
    private double batchSize;
    private String strategy;
    private String status; // Draft, Finalized, Archived
    private String version;
    private String notes;
    private double costPerKg;
    private boolean locked;
    private boolean finalized;

    @ElementCollection
    private List<String> tags;

    @ManyToOne
    private FeedProfile feedProfile;

    @OneToMany(mappedBy = "formulation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormulationIngredient> ingredients;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    // Custom accessors (already provided in your code but kept here for clarity)
    public boolean isFinalized() {
        return finalized;
    }

    public void setFinalized(boolean finalized) {
        this.finalized = finalized;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDate updatedAt) {
        this.updatedAt = updatedAt;
    }
}
