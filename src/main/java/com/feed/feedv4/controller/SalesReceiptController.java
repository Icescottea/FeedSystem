package com.feed.feedv4.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.feed.feedv4.dto.SalesReceiptDTO;
import com.feed.feedv4.service.SalesReceiptService;

@RestController
@RequestMapping("/api/sales-receipts")
public class SalesReceiptController {

    private final SalesReceiptService salesReceiptService;

    public SalesReceiptController(SalesReceiptService salesReceiptService) {
        this.salesReceiptService = salesReceiptService;
    }

    // GET /api/sales-receipts
    @GetMapping
    public ResponseEntity<List<SalesReceiptDTO>> getAllSalesReceipts() {
        return ResponseEntity.ok(salesReceiptService.getAllSalesReceipts());
    }

    // GET /api/sales-receipts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SalesReceiptDTO> getSalesReceiptById(@PathVariable Long id) {
        return ResponseEntity.ok(salesReceiptService.getSalesReceiptById(id));
    }

    // GET /api/sales-receipts/next-number
    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextReceiptNumber() {
        String number = salesReceiptService.generateNextReceiptNumber();
        return ResponseEntity.ok(Map.of("salesReceiptNumber", number));
    }

    // POST /api/sales-receipts
    @PostMapping
    public ResponseEntity<SalesReceiptDTO> createSalesReceipt(@RequestBody SalesReceiptDTO dto) {
        SalesReceiptDTO created = salesReceiptService.createSalesReceipt(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/sales-receipts/{id}
    @PutMapping("/{id}")
    public ResponseEntity<SalesReceiptDTO> updateSalesReceipt(
            @PathVariable Long id,
            @RequestBody SalesReceiptDTO dto) {
        SalesReceiptDTO updated = salesReceiptService.updateSalesReceipt(id, dto);
        return ResponseEntity.ok(updated);
    }

    // PATCH /api/sales-receipts/{id}/void
    @PatchMapping("/{id}/void")
    public ResponseEntity<SalesReceiptDTO> voidSalesReceipt(@PathVariable Long id) {
        SalesReceiptDTO voided = salesReceiptService.voidSalesReceipt(id);
        return ResponseEntity.ok(voided);
    }

    // DELETE /api/sales-receipts/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalesReceipt(@PathVariable Long id) {
        salesReceiptService.deleteSalesReceipt(id);
        return ResponseEntity.noContent().build();
    }
}