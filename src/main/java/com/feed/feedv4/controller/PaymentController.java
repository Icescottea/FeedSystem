package com.feed.feedv4.controller;

import com.feed.feedv4.dto.CreatePaymentDTO;
import com.feed.feedv4.model.Payment;
import com.feed.feedv4.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // List all payments
    @GetMapping
    public ResponseEntity<List<Payment>> list() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // Get one payment by id
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    // List payments for a specific invoice
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<Payment>> getByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsForInvoice(invoiceId));
    }

    // Create a payment (saves tax/discount, updates invoice totals + status)
    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody CreatePaymentDTO dto) {
        return ResponseEntity.ok(paymentService.createPayment(dto));
    }

    // Delete a payment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
