package com.feed.feedv4.controller;

import com.feed.feedv4.dto.InvoiceDTO;
import com.feed.feedv4.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getAll() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PostMapping
    public ResponseEntity<InvoiceDTO> create(@Valid @RequestBody InvoiceDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(invoiceService.createInvoice(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceDTO dto) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/void")
    public ResponseEntity<InvoiceDTO> voidInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.voidInvoice(id));
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<InvoiceDTO> cloneInvoice(@PathVariable Long id) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(invoiceService.cloneInvoice(id));
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<InvoiceDTO> recordPayment(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {
        BigDecimal amount = body.get("amount");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(invoiceService.recordPayment(id, amount));
    }
}