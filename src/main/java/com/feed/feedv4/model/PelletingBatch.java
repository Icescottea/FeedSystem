package com.feed.feedv4.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PelletingBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Formulation formulation;

    private double targetQuantityKg;

    private String machineUsed;

    @ManyToOne
    private User operator;

    private String status; // Not Started, In Progress, Completed

    private double actualYieldKg;

    private String operatorComments;

    private double totalWastageKg;

    @ElementCollection
    private List<String> leftoverRawMaterials;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
    
    @Transient
    private Long timeTakenMinutes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
