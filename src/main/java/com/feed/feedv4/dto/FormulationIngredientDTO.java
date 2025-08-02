package com.feed.feedv4.dto;

public class FormulationIngredientDTO {
    private Long materialId;
    private String name;
    private double percentage;
    private double quantityKg;
    
    // Getters and setters
    public Long getMaterialId() { return materialId; }
    public void setMaterialId(Long materialId) { this.materialId = materialId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
    
    public double getQuantityKg() { return quantityKg; }
    public void setQuantityKg(double quantityKg) { this.quantityKg = quantityKg; }
}