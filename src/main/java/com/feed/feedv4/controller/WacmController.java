package com.feed.feedv4.controller;

import com.feed.feedv4.model.InventoryMovement;
import com.feed.feedv4.model.RawMaterial;
import com.feed.feedv4.repository.InventoryMovementRepository;
import com.feed.feedv4.service.WacmService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/wacm")
public class WacmController {

    private final WacmService wacmService;
    private final InventoryMovementRepository movementRepo;

    public WacmController(WacmService wacmService,
                          InventoryMovementRepository movementRepo) {
        this.wacmService = wacmService;
        this.movementRepo = movementRepo;
    }

    /* ----------------- RECEIVE STOCK (UPDATE) ----------------- */
    @PostMapping("/receive")
    public ResponseEntity<RawMaterial> receive(@RequestBody ReceiveRequest req) {
        if (req.rawMaterialId() == null || req.quantity() == null || req.unitCost() == null) {
            return ResponseEntity.badRequest().build();
        }
        RawMaterial updated = wacmService.receiveStock(
                req.rawMaterialId(),
                req.quantity(),
                req.unitCost(),
                req.reference()   // optional
        );
        return ResponseEntity.ok(updated);
    }

    /* ----------------- ISSUE STOCK (DISPATCH) ----------------- */
    @PostMapping("/issue")
    public ResponseEntity<RawMaterial> issue(@RequestBody IssueRequest req) {
        if (req.rawMaterialId() == null || req.quantity() == null) {
            return ResponseEntity.badRequest().build();
        }
        RawMaterial updated = wacmService.issueStock(
                req.rawMaterialId(),
                req.quantity(),
                req.reference()   // optional
        );
        return ResponseEntity.ok(updated);
    }

    /* ----------------- MOVEMENTS (AUDIT / HISTORY) ----------------- */
    @GetMapping("/movements")
    public ResponseEntity<List<InventoryMovement>> movements(
            @RequestParam Long rawMaterialId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        if (from != null && to != null) {
            return ResponseEntity.ok(
                movementRepo.findByRawMaterialIdAndMovementDateBetweenOrderByMovementDateDesc(
                    rawMaterialId, from, to
                )
            );
        }
        return ResponseEntity.ok(
            movementRepo.findByRawMaterialIdOrderByMovementDateDesc(rawMaterialId)
        );
    }

    /* ----------------- Request DTOs ----------------- */
    public record ReceiveRequest(
            Long rawMaterialId,
            Double quantity,
            Double unitCost,
            String reference
    ) {}

    public record IssueRequest(
            Long rawMaterialId,
            Double quantity,
            String reference
    ) {}
}
