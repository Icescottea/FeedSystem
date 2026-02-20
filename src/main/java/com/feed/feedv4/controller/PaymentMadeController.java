package com.feed.feedv4.controller;

import com.feed.feedv4.dto.PaymentMadeDTO;
import com.feed.feedv4.service.PaymentMadeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments-made")
@RequiredArgsConstructor
public class PaymentMadeController {

    private final PaymentMadeService paymentMadeService;

    @GetMapping
    public ResponseEntity<List<PaymentMadeDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentMadeService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentMadeDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentMadeService.getPaymentById(id));
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<PaymentMadeDTO>> getPaymentsByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(paymentMadeService.getPaymentsByVendor(vendorId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PaymentMadeDTO>> searchPayments(@RequestParam String query) {
        return ResponseEntity.ok(paymentMadeService.searchPayments(query));
    }

    @PostMapping
    public ResponseEntity<PaymentMadeDTO> createPayment(@Valid @RequestBody PaymentMadeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentMadeService.createPayment(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMadeDTO> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentMadeDTO dto) {
        return ResponseEntity.ok(paymentMadeService.updatePayment(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentMadeService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/void")
    public ResponseEntity<PaymentMadeDTO> voidPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentMadeService.voidPayment(id));
    }
}