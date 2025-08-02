package com.feed.feedv4.dto;

import lombok.Data;

@Data
public class FormulationGenerationRequest {
    private Long profileId;
    private double batchSize;
    private String name;
    private String factory;
}

