package com.feed.feedv4.dto;

import java.time.LocalDate;

public class InventoryResponseDTO {
    private Long id;
    private String materialName;
    private String category;
    private String unit;
    private double stock;
    private LocalDate expiryDate;
    private double crudeProtein;
    private double metabolizableEnergy;
    private boolean locked;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMaterialName() { return materialName; }
    public void setMaterialName(String materialName) { this.materialName = materialName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public double getStock() { return stock; }
    public void setStock(double stock) { this.stock = stock; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public double getCrudeProtein() { return crudeProtein; }
    public void setCrudeProtein(double crudeProtein) { this.crudeProtein = crudeProtein; }

    public double getMetabolizableEnergy() { return metabolizableEnergy; }
    public void setMetabolizableEnergy(double metabolizableEnergy) { this.metabolizableEnergy = metabolizableEnergy; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
}