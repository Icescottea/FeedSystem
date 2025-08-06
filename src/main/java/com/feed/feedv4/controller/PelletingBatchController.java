package com.feed.feedv4.controller;

import com.feed.feedv4.model.PelletingBatch;
import com.feed.feedv4.service.PelletingBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pelleting")
public class PelletingBatchController {

    @Autowired
    private PelletingBatchService service;

    @GetMapping
    public List<PelletingBatch> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public PelletingBatch get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping("/create")
    public ResponseEntity<PelletingBatch> create(@RequestBody Map<String, Object> body) {
        System.out.println("Received payload: " + body);
        try {
            if (!body.containsKey("formulationId") || !body.containsKey("targetQuantityKg") ||
                !body.containsKey("machineUsed") || !body.containsKey("operatorId")) {
                return ResponseEntity.badRequest().build();
            }

            Long formulationId = Long.valueOf(body.get("formulationId").toString());
            double targetKg = Double.parseDouble(body.get("targetQuantityKg").toString());
            String machine = body.get("machineUsed").toString();
            Long operatorId = Long.valueOf(body.get("operatorId").toString());

            PelletingBatch batch = service.create(formulationId, targetKg, machine, operatorId);
            return ResponseEntity.ok(batch);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PelletingBatch> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        return ResponseEntity.ok(service.updateStatus(id, newStatus));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<PelletingBatch> logCompletion(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        double actualYield = Double.parseDouble(body.get("actualYieldKg").toString());
        String comments = body.get("operatorComments").toString();
        List<String> leftovers = (List<String>) body.get("leftoverRawMaterials");
        double wastage = Double.parseDouble(body.get("totalWastageKg").toString());

        return ResponseEntity.ok(service.logCompletion(id, actualYield, comments, leftovers, wastage));
    }

    @PostMapping("/{id}/send-to-finance")
    public ResponseEntity<String> sendToFinance(@PathVariable Long id) {
        // Placeholder logic – you can later redirect or generate invoice
        PelletingBatch batch = service.get(id);
        if (!"Completed".equals(batch.getStatus())) {
            return ResponseEntity.badRequest().body("Only completed batches can be sent to finance");
        }

        // Simulate forwarding to finance module (to be implemented)
        return ResponseEntity.ok("Batch " + id + " sent to finance module.");
    }

    @GetMapping("/batches")
    public ResponseEntity<List<PelletingBatch>> getAllBatches() {
        return ResponseEntity.ok(service.getAll());
    }
    
    @GetMapping("/my-batches")
    public ResponseEntity<List<PelletingBatch>> getMyBatches(@RequestParam Long operatorId) {
        return ResponseEntity.ok(service.getByOperator(operatorId));
    }

}
