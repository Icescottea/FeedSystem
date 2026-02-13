package com.feed.feedv4.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.repository.InvoiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {
    
    private final InvoiceRepository invoiceRepository;
    
    public Map<String, Object> processPayment(Long invoiceId, BigDecimal paymentAmount) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        
        Map<String, Object> result = new HashMap<>();
        
        // Validate payment amount
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }
        
        if (paymentAmount.compareTo(invoice.getBalanceDue()) > 0) {
            throw new RuntimeException("Payment amount cannot exceed balance due");
        }
        
        // Record payment using the Invoice entity method
        invoice.recordPayment(paymentAmount);
        
        // Save updated invoice
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        
        result.put("success", true);
        result.put("invoiceId", invoiceId);
        result.put("paymentAmount", paymentAmount);
        result.put("newBalanceDue", updatedInvoice.getBalanceDue());
        result.put("status", updatedInvoice.getStatus().name());
        
        return result;
    }
    
    public Map<String, Object> getPaymentStatus(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        
        Map<String, Object> status = new HashMap<>();
        status.put("invoiceId", invoiceId);
        status.put("invoiceNumber", invoice.getInvoiceNumber());
        status.put("total", invoice.getTotal());
        status.put("amountPaid", invoice.getAmountPaid());
        status.put("balanceDue", invoice.getBalanceDue());
        status.put("status", invoice.getStatus().name());
        status.put("isPaid", invoice.getStatus() == Invoice.InvoiceStatus.PAID);
        status.put("isPartiallyPaid", invoice.getStatus() == Invoice.InvoiceStatus.PARTIALLY_PAID);
        
        return status;
    }
    
    public List<Map<String, Object>> getOutstandingInvoices(Long customerId) {
        List<Invoice> invoices = invoiceRepository.findOutstandingInvoicesByCustomerId(customerId);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Invoice invoice : invoices) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", invoice.getId());
            item.put("invoiceNumber", invoice.getInvoiceNumber());
            item.put("invoiceDate", invoice.getInvoiceDate());
            item.put("dueDate", invoice.getDueDate());
            item.put("total", invoice.getTotal());
            item.put("balanceDue", invoice.getBalanceDue());
            item.put("status", invoice.getStatus().name());
            result.add(item);
        }
        
        return result;
    }
    
    public Map<String, Object> reversePayment(Long invoiceId, BigDecimal amount) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        
        if (amount.compareTo(invoice.getAmountPaid()) > 0) {
            throw new RuntimeException("Reversal amount cannot exceed paid amount");
        }
        
        // Reverse payment using Invoice entity method
        invoice.reversePayment(amount);
        
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("invoiceId", invoiceId);
        result.put("reversalAmount", amount);
        result.put("newBalanceDue", updatedInvoice.getBalanceDue());
        result.put("status", updatedInvoice.getStatus().name());
        
        return result;
    }
}