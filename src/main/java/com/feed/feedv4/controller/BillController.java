package com.feed.feedv4.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.feed.feedv4.dto.BillDTO;
import com.feed.feedv4.service.BillService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bills")
public class BillController {
    
    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping
    public ResponseEntity<List<BillDTO>> getAllBills() {
        List<BillDTO> bills = billService.getAllBills();
        return ResponseEntity.ok(bills);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BillDTO> getBillById(@PathVariable Long id) {
        BillDTO bill = billService.getBillById(id);
        return ResponseEntity.ok(bill);
    }
    
    @GetMapping("/vendor/{vendorId}/outstanding")
    public ResponseEntity<List<BillDTO>> getOutstandingBillsByVendor(@PathVariable Long vendorId) {
        List<BillDTO> bills = billService.getOutstandingBillsByVendor(vendorId);
        return ResponseEntity.ok(bills);
    }
    
    @PostMapping
    public ResponseEntity<BillDTO> createBill(@Valid @RequestBody BillDTO dto) {
        BillDTO created = billService.createBill(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<BillDTO> updateBill(
            @PathVariable Long id,
            @Valid @RequestBody BillDTO dto) {
        BillDTO updated = billService.updateBill(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/void")
    public ResponseEntity<BillDTO> voidBill(@PathVariable Long id) {
        BillDTO voided = billService.voidBill(id);
        return ResponseEntity.ok(voided);
    }
    
    @PostMapping("/{id}/clone")
    public ResponseEntity<BillDTO> cloneBill(@PathVariable Long id) {
        BillDTO cloned = billService.cloneBill(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(cloned);
    }
    
    @PutMapping("/{id}/record-payment")
    public ResponseEntity<BillDTO> recordPayment(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        BillDTO updated = billService.recordPayment(id, amount);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<BillDTO>> getOverdueBills() {
        List<BillDTO> bills = billService.getOverdueBills();
        return ResponseEntity.ok(bills);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<BillDTO>> searchBills(@RequestParam String query) {
        List<BillDTO> bills = billService.searchBills(query);
        return ResponseEntity.ok(bills);
    }
}