package com.feed.feedv4.controller;

import com.feed.feedv4.dto.CreateInvoiceDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    // ===== List / Read =====

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(invoiceService.getInvoice(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Lightweight list of unpaid (or partially paid) invoices for pickers.
     * Returns: id, customerName, totalAmount, amountPaid
     */
    @GetMapping("/unpaid")
    public ResponseEntity<List<UnpaidInvoiceOption>> getUnpaidOptions() {
        List<Invoice> all = invoiceService.getAllInvoices(); // simple & safe
        List<UnpaidInvoiceOption> out = all.stream()
                .filter(inv -> {
                    double total = nvl(inv.getTotalAmount(), inv.getAmount());
                    double paid  = nvl(inv.getPaidAmount(), inv.getAmountPaid()); // support either getter name
                    return paid < total;
                })
                .map(inv -> new UnpaidInvoiceOption(
                        inv.getId(),
                        inv.getCustomerName(),
                        nvl(inv.getTotalAmount(), inv.getAmount()),
                        nvl(inv.getPaidAmount(), inv.getAmountPaid())
                ))
                .toList();
        return ResponseEntity.ok(out);
    }

    /**
     * Backward compat: existing endpoint you already use.
     * Kept as-is; can be removed later if unused.
     */
    @GetMapping("/unpaid-customers")
    public ResponseEntity<List<String>> getUnpaidCustomers() {
        return ResponseEntity.ok(invoiceService.getUnpaidCustomerNames());
    }

    // ===== Create / Update / Delete =====

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody CreateInvoiceDTO dto) {
        // NOTE: ensure your service sets dateIssued if null
        return ResponseEntity.ok(invoiceService.createInvoice(dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Invoice>> getInvoicesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByCustomer(customerId));
    }

    // ===== DTO for /unpaid =====
    public record UnpaidInvoiceOption(
            Long id,
            String customerName,
            Double totalAmount,
            Double amountPaid
    ) {}

    // small null-safe helper; prefers primary, else fallback; returns 0 if both null
    private static double nvl(Double primary, Double fallback) {
        if (primary != null) return primary;
        if (fallback != null) return fallback;
        return 0d;
    }
}
