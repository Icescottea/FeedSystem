package com.feed.feedv4.dto;

import java.util.List;

public class FormulationSaveRequest {
    public String name;
    public String factory;
    public Long profileId;       // optional if you don't use FeedProfile
    public double batchSize;
    public List<IngredientDTO> ingredients;

    public static class IngredientDTO {
        public Long materialId;      // raw_material_id coming from editor
        public String name;          // fallback display name
        public Double percentage;    // % of batch (0-100)
        public Double quantityKg;    // absolute kg
        public Double costPerKg;     // optional override
    }
}
