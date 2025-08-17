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

    /* ---------- helpers ---------- */

    private void calculateTimeTaken(PelletingBatch b) {
        if (b == null) return;
        if (b.getStartTime() != null && b.getEndTime() != null) {
            long minutes = java.time.Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
            b.setTimeTakenMinutes(minutes);
        } else {
            b.setTimeTakenMinutes(null); // or 0L if you prefer zero
        }
    }

    public PelletingBatchService(PelletingBatchRepository pelletingRepo,
                                 FormulationRepository formulationRepo,
                                 UserRepository userRepo) {
        this.pelletingRepo = pelletingRepo;
        this.formulationRepo = formulationRepo;
        this.userRepo = userRepo;
    }

    /* ---------- create / read ---------- */

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
        batch.setCustomerId(f.getCustomerId());

        PelletingBatch saved = pelletingRepo.save(batch);
        calculateTimeTaken(saved);
        return saved;
    }

    public List<PelletingBatch> getAll(String status, Boolean archived) {
        if (archived != null) {
            if (status != null && !status.isBlank()) {
                return pelletingRepo.findByStatus(status)
                        .stream().filter(b -> b.isArchived() == archived).toList();
            }
            return pelletingRepo.findAll()
                    .stream().filter(b -> b.isArchived() == archived).toList();
        }
        if (status != null && !status.isBlank()) {
            return pelletingRepo.findByStatusAndArchivedFalse(status);
        }
        return pelletingRepo.findByArchivedFalse();
    }

    public PelletingBatch setArchived(Long id, boolean archived) {
        PelletingBatch b = get(id);
        b.setArchived(archived);
        b.setUpdatedAt(LocalDateTime.now());
        return pelletingRepo.save(b);
    }

    public PelletingBatch get(Long id) {
        PelletingBatch b = pelletingRepo.findWithFormulationById(id).orElseThrow();
        calculateTimeTaken(b);          // keep your existing helper
        return b;
    }

    public List<PelletingBatch> getByOperator(Long operatorId) {
        List<PelletingBatch> list = pelletingRepo.findByOperatorId(operatorId);
        list.forEach(this::calculateTimeTaken);
        return list;
    }

    /* ---------- status update (legacy) ---------- */

    public PelletingBatch updateStatus(Long id, String status) {
        PelletingBatch batch = pelletingRepo.findById(id).orElseThrow();
        // guard: cannot change once in progress or completed
        if ("In Progress".equals(batch.getStatus()) || "Completed".equals(batch.getStatus())) {
            throw new RuntimeException("Cannot change status from " + batch.getStatus());
        }

        if ("In Progress".equals(status)) {
            batch.setStartTime(LocalDateTime.now());
        } else if ("Completed".equals(status)) {
            LocalDateTime end = LocalDateTime.now();
            batch.setEndTime(end);
        }
        batch.setStatus(status);
        batch.setUpdatedAt(LocalDateTime.now());

        PelletingBatch saved = pelletingRepo.save(batch);
        calculateTimeTaken(saved);
        return saved;
    }

    /* ---------- start / complete ---------- */

    public PelletingBatch startBatch(Long id, String machineUsed, Long operatorId) {
        if (machineUsed == null || machineUsed.isBlank()) {
            throw new IllegalArgumentException("Machine is required");
        }

        User operator = userRepo.findById(operatorId)
            .orElseThrow(() -> new IllegalArgumentException("Operator not found"));

        boolean isOperator = operator.getRoles() != null &&
                operator.getRoles().stream()
                    .anyMatch(r -> "OPERATOR".equalsIgnoreCase(String.valueOf(r)));
        if (!isOperator) throw new IllegalArgumentException("User is not an OPERATOR");

        PelletingBatch batch = pelletingRepo.findById(id).orElseThrow();
        if (!"Not Started".equals(batch.getStatus())) {
            throw new IllegalStateException("Can only start a 'Not Started' batch");
        }

        batch.setMachineUsed(machineUsed);
        batch.setOperator(operator);
        batch.setStartTime(LocalDateTime.now());
        batch.setStatus("In Progress");
        batch.setUpdatedAt(LocalDateTime.now());

        PelletingBatch saved = pelletingRepo.save(batch);
        calculateTimeTaken(saved);
        return saved;
    }

    public PelletingBatch completeBatch(Long id, String comments, Double actualYield, List<String> leftovers, Double wastage) {
        if (comments == null || comments.isBlank()) {
            throw new IllegalArgumentException("Comments are required");
        }

        PelletingBatch batch = pelletingRepo.findById(id).orElseThrow();
        if (!"In Progress".equals(batch.getStatus())) {
            throw new IllegalStateException("Can only complete an 'In Progress' batch");
        }

        LocalDateTime end = LocalDateTime.now();
        batch.setEndTime(end);
        batch.setOperatorComments(comments);
        if (actualYield != null) batch.setActualYieldKg(actualYield);
        if (leftovers != null) batch.setLeftoverRawMaterials(leftovers);
        if (wastage != null) batch.setTotalWastageKg(wastage);
        batch.setStatus("Completed");
        batch.setUpdatedAt(end);

        // compute transient minutes for response
        calculateTimeTaken(batch);

        PelletingBatch saved = pelletingRepo.save(batch);
        // recalc not strictly needed after save, but harmless
        calculateTimeTaken(saved);
        return saved;
    }
}
