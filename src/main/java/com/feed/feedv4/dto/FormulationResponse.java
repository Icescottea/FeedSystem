package com.feed.feedv4.dto;

import java.util.List;
import java.util.Map;

public class FormulationResponse {
    private Long profileId;
    private double batchSize;
    private List<FormulationIngredientDTO> ingredients;
    private double costPerKg;
    private Map<String, Double> achievedNutrients;

    // Add this constructor
    public FormulationResponse(Long profileId, 
                             double batchSize, 
                             List<FormulationIngredientDTO> ingredients,
                             double costPerKg, 
                             Map<String, Double> achievedNutrients) {
        this.profileId = profileId;
        this.batchSize = batchSize;
        this.ingredients = ingredients;
        this.costPerKg = costPerKg;
        this.achievedNutrients = achievedNutrients;
    }

    // Add no-args constructor if using JPA
    public FormulationResponse() {}

    // Getters and setters for all fields
    public Long getProfileId() { return profileId; }
    public void setProfileId(Long profileId) { this.profileId = profileId; }
    
    public double getBatchSize() { return batchSize; }
    public void setBatchSize(double batchSize) { this.batchSize = batchSize; }
    
    public List<FormulationIngredientDTO> getIngredients() { return ingredients; }
    public void setIngredients(List<FormulationIngredientDTO> ingredients) { this.ingredients = ingredients; }
    
    public double getCostPerKg() { return costPerKg; }
    public void setCostPerKg(double costPerKg) { this.costPerKg = costPerKg; }
    
    public Map<String, Double> getAchievedNutrients() { return achievedNutrients; }
    public void setAchievedNutrients(Map<String, Double> achievedNutrients) { this.achievedNutrients = achievedNutrients; }
}