package com.feed.feedv4.dto;

public record IngredientViewDTO (
    String name, 
    double percentage,
    double quantityKg
) {}
