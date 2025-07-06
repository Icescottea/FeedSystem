package com.feed.feedv4.dto;

import lombok.Data;
import java.util.List;

@Data
public class FormulationRequest {
    private Long profileId;
    private double batchSize;
    private List<String> strategy;
    private List<String> lockedIngredients;
}
