package com.feed.feedv4.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.feed.feedv4.dto.InvoiceDTO;
import com.feed.feedv4.service.InvoiceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvoiceController {
    
    private final InvoiceService invoiceService;
    
    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices() {
        List<InvoiceDTO> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Long id) {
        InvoiceDTO invoice = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(invoice);
    }
    
    @GetMapping("/customer/{customerId}/outstanding")
    public ResponseEntity<List<InvoiceDTO>> getOutstandingInvoicesByCustomer(@PathVariable Long customerId) {
        List<InvoiceDTO> invoices = invoiceService.getOutstandingInvoicesByCustomer(customerId);
        return ResponseEntity.ok(invoices);
    }
    
    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@Valid @RequestBody InvoiceDTO dto) {
        InvoiceDTO created = invoiceService.createInvoice(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDTO> updateInvoice(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceDTO dto) {
        InvoiceDTO updated = invoiceService.updateInvoice(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/void")
    public ResponseEntity<InvoiceDTO> voidInvoice(@PathVariable Long id) {
        InvoiceDTO voided = invoiceService.voidInvoice(id);
        return ResponseEntity.ok(voided);
    }
    
    @PostMapping("/{id}/clone")
    public ResponseEntity<InvoiceDTO> cloneInvoice(@PathVariable Long id) {
        InvoiceDTO cloned = invoiceService.cloneInvoice(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(cloned);
    }
    
    @PutMapping("/{id}/record-payment")
    public ResponseEntity<InvoiceDTO> recordPayment(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        InvoiceDTO updated = invoiceService.recordPayment(id, amount);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceDTO>> getOverdueInvoices() {
        List<InvoiceDTO> invoices = invoiceService.getOverdueInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<InvoiceDTO>> searchInvoices(@RequestParam String query) {
        List<InvoiceDTO> invoices = invoiceService.searchInvoices(query);
        return ResponseEntity.ok(invoices);
    }
}