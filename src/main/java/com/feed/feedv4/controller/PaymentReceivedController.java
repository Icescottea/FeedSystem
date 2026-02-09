package com.feed.feedv4.controller;

import com.feed.feedv4.dto.PaymentReceivedDTO;
import com.feed.feedv4.service.PaymentReceivedService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments-received")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentReceivedController {
    
    private final PaymentReceivedService paymentReceivedService;
    
    @GetMapping
    public ResponseEntity<List<PaymentReceivedDTO>> getAllPayments() {
        List<PaymentReceivedDTO> payments = paymentReceivedService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PaymentReceivedDTO> getPaymentById(@PathVariable Long id) {
        PaymentReceivedDTO payment = paymentReceivedService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }
    
    @PostMapping
    public ResponseEntity<PaymentReceivedDTO> createPayment(@Valid @RequestBody PaymentReceivedDTO dto) {
        PaymentReceivedDTO created = paymentReceivedService.createPayment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PaymentReceivedDTO> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentReceivedDTO dto) {
        PaymentReceivedDTO updated = paymentReceivedService.updatePayment(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentReceivedService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/void")
    public ResponseEntity<PaymentReceivedDTO> voidPayment(@PathVariable Long id) {
        PaymentReceivedDTO voided = paymentReceivedService.voidPayment(id);
        return ResponseEntity.ok(voided);
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentReceivedDTO>> getPaymentsByCustomer(@PathVariable Long customerId) {
        List<PaymentReceivedDTO> payments = paymentReceivedService.getPaymentsByCustomer(customerId);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<PaymentReceivedDTO>> searchPayments(@RequestParam String query) {
        List<PaymentReceivedDTO> payments = paymentReceivedService.searchPayments(query);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<PaymentReceivedDTO>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PaymentReceivedDTO> payments = paymentReceivedService.getPaymentsByDateRange(startDate, endDate);
        return ResponseEntity.ok(payments);
    }
}