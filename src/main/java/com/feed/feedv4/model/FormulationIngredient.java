package com.feed.feedv4.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormulationIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rawMaterialName;
    private double quantityKg;
    private double contributionPercent;
    private double costPerKg;

    private Double percentage;
    private boolean locked;

    @ManyToOne
    @JoinColumn(name = "formulation_id")
    @JsonIgnore // Prevent circular reference in JSON serialization
    private Formulation formulation;

    @ManyToOne
    @JoinColumn(name = "raw_material_id")
    private RawMaterial rawMaterial;

    // Custom methods (redundant with Lombok, but included for clarity and safe handling)
    public RawMaterial getRawMaterial() {
        return rawMaterial;
    }

    public void setRawMaterial(RawMaterial rawMaterial) {
        this.rawMaterial = rawMaterial;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setFormulation(Formulation formulation) {
        this.formulation = formulation;
    }
}
