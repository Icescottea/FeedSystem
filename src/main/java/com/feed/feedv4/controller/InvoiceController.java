package com.feed.feedv4.controller;

import com.feed.feedv4.dto.CreateInvoiceDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable Long id) {
        Invoice invoice = invoiceService.getInvoice(id);
        return ResponseEntity.ok(invoice);
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody CreateInvoiceDTO dto) {
        System.out.println("DTO received: " + dto); // debug log
        Invoice invoice = invoiceService.createInvoice(dto);
        return ResponseEntity.ok(invoice);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Invoice updated = invoiceService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/customer/{customerId}")
    public List<Invoice> getInvoicesByCustomer(@PathVariable Long customerId) {
        return invoiceService.getInvoicesByCustomer(customerId);
    }

    @GetMapping("/unpaid-customers")
    public List<String> getUnpaidCustomers() {
        return invoiceService.getUnpaidCustomerNames();
    }

}
