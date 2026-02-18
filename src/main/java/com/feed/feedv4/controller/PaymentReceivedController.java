package com.feed.feedv4.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
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

import com.feed.feedv4.dto.PaymentReceivedDTO;
import com.feed.feedv4.service.PaymentReceivedService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments-received")
public class PaymentReceivedController {

    private final PaymentReceivedService paymentReceivedService;

    public PaymentReceivedController(PaymentReceivedService paymentReceivedService) {
        this.paymentReceivedService = paymentReceivedService;
    }

    // GET /api/payments-received
    @GetMapping
    public ResponseEntity<List<PaymentReceivedDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentReceivedService.getAllPayments());
    }

    // GET /api/payments-received/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PaymentReceivedDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentReceivedService.getPaymentById(id));
    }

    // GET /api/payments-received/next-number
    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextPaymentNumber() {
        return ResponseEntity.ok(Map.of("paymentNumber", paymentReceivedService.generatePaymentNumber()));
    }

    // POST /api/payments-received
    @PostMapping
    public ResponseEntity<PaymentReceivedDTO> createPayment(@Valid @RequestBody PaymentReceivedDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentReceivedService.createPayment(dto));
    }

    // PUT /api/payments-received/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PaymentReceivedDTO> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentReceivedDTO dto) {
        return ResponseEntity.ok(paymentReceivedService.updatePayment(id, dto));
    }

    // DELETE /api/payments-received/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentReceivedService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/payments-received/{id}/void
    @PostMapping("/{id}/void")
    public ResponseEntity<PaymentReceivedDTO> voidPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentReceivedService.voidPayment(id));
    }

    // GET /api/payments-received/customer/{customerId}
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentReceivedDTO>> getPaymentsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(paymentReceivedService.getPaymentsByCustomer(customerId));
    }

    // GET /api/payments-received/search?query=...
    @GetMapping("/search")
    public ResponseEntity<List<PaymentReceivedDTO>> searchPayments(@RequestParam String query) {
        return ResponseEntity.ok(paymentReceivedService.searchPayments(query));
    }

    // GET /api/payments-received/date-range?startDate=...&endDate=...
    @GetMapping("/date-range")
    public ResponseEntity<List<PaymentReceivedDTO>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(paymentReceivedService.getPaymentsByDateRange(startDate, endDate));
    }
}