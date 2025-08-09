package com.feed.feedv4.service;

import com.feed.feedv4.model.PelletingBatch;
import com.feed.feedv4.model.Formulation;
import com.feed.feedv4.model.User;
import com.feed.feedv4.repository.PelletingBatchRepository;
import com.feed.feedv4.repository.FormulationRepository;
import com.feed.feedv4.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PelletingBatchService {

    @Autowired
    private PelletingBatchRepository pelletingRepo;

    @Autowired
    private FormulationRepository formulationRepo;

    @Autowired
    private UserRepository userRepo;

    public PelletingBatch create(Long formulationId, double targetKg, String machine, Long operatorId) {
        Formulation f = formulationRepo.findById(formulationId)
                .orElseThrow(() -> new RuntimeException("Formulation not found"));

        if (!f.isFinalized()) throw new RuntimeException("Only finalized formulations can be used");

        User operator = userRepo.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("Operator not found"));

        PelletingBatch batch = new PelletingBatch();
        batch.setFormulation(f);
        batch.setTargetQuantityKg(targetKg);
        batch.setMachineUsed(machine);
        batch.setOperator(operator);
        batch.setStatus("Not Started");
        batch.setCreatedAt(LocalDateTime.now());
        batch.setUpdatedAt(LocalDateTime.now());

        return pelletingRepo.save(batch);
    }

    public List<PelletingBatch> getAll() {
        return pelletingRepo.findAll();
    }

    public PelletingBatch get(Long id) {
        return pelletingRepo.findById(id).orElseThrow();
    }

    public PelletingBatch updateStatus(Long id, String status) {
        PelletingBatch batch = get(id);
        batch.setStatus(status);
        if ("In Progress".equals(batch.getStatus()) || "Completed".equals(batch.getStatus())) {
            throw new RuntimeException("Cannot change status from " + batch.getStatus());
        }
        if ("In Progress".equals(status)) {
            batch.setStartTime(LocalDateTime.now());
        } else if ("Completed".equals(status)) {
            LocalDateTime end = LocalDateTime.now();
            batch.setEndTime(end);  

            if (batch.getStartTime() != null) {
                long minutes = java.time.Duration.between(batch.getStartTime(), end).toMinutes();
                batch.setTimeTakenMinutes(minutes);
            } else {
                batch.setTimeTakenMinutes(0L);
            }

        }
        batch.setUpdatedAt(LocalDateTime.now());
        return pelletingRepo.save(batch);
    }

    public PelletingBatch logCompletion(Long id, double actualYield, String comments, List<String> leftovers, double wastage) {
        PelletingBatch batch = get(id);
        batch.setActualYieldKg(actualYield);
        batch.setOperatorComments(comments);
        batch.setLeftoverRawMaterials(leftovers);
        batch.setTotalWastageKg(wastage);
        batch.setEndTime(LocalDateTime.now());
        batch.setStatus("Completed");
        batch.setUpdatedAt(LocalDateTime.now());
        if (batch.getStartTime() != null && batch.getEndTime() != null) {
            long minutes = java.time.Duration.between(batch.getStartTime(), batch.getEndTime()).toMinutes();
            batch.setTimeTakenMinutes(minutes);
        }
        return pelletingRepo.save(batch);
        
    }

    public List<PelletingBatch> getByOperator(Long operatorId) {
        return pelletingRepo.findByOperatorId(operatorId);
    }

    public PelletingBatch startBatch(Long id, String machineUsed, Long operatorId) {
        if (machineUsed == null || machineUsed.isBlank()) {
            throw new IllegalArgumentException("Machine is required");
        }

        // Fetch operator and validate existence
        User operator = userRepo.findById(operatorId)
            .orElseThrow(() -> new IllegalArgumentException("Operator not found"));

        // Validate the user has OPERATOR role (works for enum or String roles)
        boolean isOperator = operator.getRoles() != null &&
                operator.getRoles().stream()
                    .anyMatch(r -> "OPERATOR".equalsIgnoreCase(String.valueOf(r)));

        if (!isOperator) {
            throw new IllegalArgumentException("User is not an OPERATOR");
        }

        // Fetch batch and validate status
        PelletingBatch batch = get(id);
        if (!"Not Started".equals(batch.getStatus())) {
            throw new IllegalStateException("Can only start a 'Not Started' batch");
        }

        // Start batch
        batch.setMachineUsed(machineUsed);
        batch.setOperator(operator);
        batch.setStartTime(LocalDateTime.now());
        batch.setStatus("In Progress");
        batch.setUpdatedAt(LocalDateTime.now());

        return pelletingRepo.save(batch);
    }

    public PelletingBatch completeBatch(Long id, String comments, Double actualYield, List<String> leftovers, Double wastage) {
        if (comments == null || comments.isBlank()) {
            throw new IllegalArgumentException("Comments are required");
        }
        PelletingBatch batch = get(id);
        if (!"In Progress".equals(batch.getStatus())) {
            throw new IllegalStateException("Can only complete an 'In Progress' batch");
        }

        LocalDateTime end = LocalDateTime.now();
        batch.setEndTime(end);
        batch.setOperatorComments(comments);
        if (actualYield != null) batch.setActualYieldKg(actualYield);
        if (leftovers != null) batch.setLeftoverRawMaterials(leftovers);
        if (wastage != null) batch.setTotalWastageKg(wastage);

        if (batch.getStartTime() != null) {
            long minutes = java.time.Duration.between(batch.getStartTime(), end).toMinutes();
            batch.setTimeTakenMinutes(minutes); // @Transient—returned in JSON
        } else {
            batch.setTimeTakenMinutes(0L);
        }

        batch.setStatus("Completed");
        batch.setUpdatedAt(end);
        return pelletingRepo.save(batch);
    }

}
