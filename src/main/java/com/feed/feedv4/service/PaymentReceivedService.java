package com.feed.feedv4.service;

import com.feed.feedv4.dto.PaymentReceivedDTO;
import com.feed.feedv4.dto.InvoicePaymentDTO;
import com.feed.feedv4.model.PaymentReceived;
import com.feed.feedv4.model.InvoicePayment;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.repository.PaymentReceivedRepository;
import com.feed.feedv4.repository.InvoicePaymentRepository;
import com.feed.feedv4.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentReceivedService {
    
    private final PaymentReceivedRepository paymentReceivedRepository;
    private final InvoicePaymentRepository invoicePaymentRepository;
    private final InvoiceRepository invoiceRepository;
    
    public List<PaymentReceivedDTO> getAllPayments() {
        return paymentReceivedRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public PaymentReceivedDTO getPaymentById(Long id) {
        PaymentReceived payment = paymentReceivedRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return convertToDTO(payment);
    }
    
    public PaymentReceivedDTO createPayment(PaymentReceivedDTO dto) {
        // Auto-generate payment number if not provided
        if (dto.getPaymentNumber() == null || dto.getPaymentNumber().isEmpty()) {
            dto.setPaymentNumber(generatePaymentNumber());
        }
        
        // Validate unique payment number
        if (paymentReceivedRepository.existsByPaymentNumber(dto.getPaymentNumber())) {
            throw new RuntimeException("Payment number " + dto.getPaymentNumber() + " already exists");
        }
        
        // Validate amount
        if (dto.getAmountReceived().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount received must be greater than zero");
        }
        
        PaymentReceived payment = convertToEntity(dto);
        
        // Process invoice payments if provided
        if (dto.getInvoicePayments() != null && !dto.getInvoicePayments().isEmpty()) {
            for (InvoicePaymentDTO ipDTO : dto.getInvoicePayments()) {
                // Update invoice
                Invoice invoice = invoiceRepository.findById(ipDTO.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + ipDTO.getInvoiceId()));
                
                // Validate payment amount
                if (ipDTO.getPaymentAmount().compareTo(invoice.getBalanceDue()) > 0) {
                    throw new RuntimeException("Payment amount cannot exceed invoice balance due");
                }
                
                // Create invoice payment link
                InvoicePayment invoicePayment = InvoicePayment.builder()
                    .invoiceId(ipDTO.getInvoiceId())
                    .invoiceBalanceDue(invoice.getBalanceDue())
                    .paymentAmount(ipDTO.getPaymentAmount())
                    .paymentDate(payment.getPaymentDate())
                    .build();
                
                payment.addInvoicePayment(invoicePayment);
                
                // Update invoice
                invoice.recordPayment(ipDTO.getPaymentAmount());
                invoiceRepository.save(invoice);
            }
        }
        
        PaymentReceived savedPayment = paymentReceivedRepository.save(payment);
        return convertToDTO(savedPayment);
    }
    
    public PaymentReceivedDTO updatePayment(Long id, PaymentReceivedDTO dto) {
        PaymentReceived existingPayment = paymentReceivedRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        
        // Cannot update if already void
        if (existingPayment.getStatus() == PaymentReceived.PaymentStatus.VOID) {
            throw new RuntimeException("Cannot update voided payment");
        }
        
        // Reverse old invoice payments
        for (InvoicePayment ip : existingPayment.getInvoicePayments()) {
            Invoice invoice = invoiceRepository.findById(ip.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
            invoice.reversePayment(ip.getPaymentAmount());
            invoiceRepository.save(invoice);
        }
        
        // Clear old invoice payments
        existingPayment.getInvoicePayments().clear();
        
        // Update fields
        updatePaymentFields(existingPayment, dto);
        
        // Add new invoice payments
        if (dto.getInvoicePayments() != null && !dto.getInvoicePayments().isEmpty()) {
            for (InvoicePaymentDTO ipDTO : dto.getInvoicePayments()) {
                Invoice invoice = invoiceRepository.findById(ipDTO.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + ipDTO.getInvoiceId()));
                
                InvoicePayment invoicePayment = InvoicePayment.builder()
                    .invoiceId(ipDTO.getInvoiceId())
                    .invoiceBalanceDue(invoice.getBalanceDue())
                    .paymentAmount(ipDTO.getPaymentAmount())
                    .paymentDate(existingPayment.getPaymentDate())
                    .build();
                
                existingPayment.addInvoicePayment(invoicePayment);
                
                // Update invoice
                invoice.recordPayment(ipDTO.getPaymentAmount());
                invoiceRepository.save(invoice);
            }
        }
        
        PaymentReceived updatedPayment = paymentReceivedRepository.save(existingPayment);
        return convertToDTO(updatedPayment);
    }
    
    public void deletePayment(Long id) {
        PaymentReceived payment = paymentReceivedRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        
        // Cannot delete if used for invoices
        if (!payment.getInvoicePayments().isEmpty()) {
            throw new RuntimeException("Cannot delete payment that has been applied to invoices. Please void instead.");
        }
        
        paymentReceivedRepository.delete(payment);
    }
    
    public PaymentReceivedDTO voidPayment(Long id) {
        PaymentReceived payment = paymentReceivedRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        
        // Reverse all invoice payments
        for (InvoicePayment ip : payment.getInvoicePayments()) {
            Invoice invoice = invoiceRepository.findById(ip.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
            invoice.reversePayment(ip.getPaymentAmount());
            invoiceRepository.save(invoice);
        }
        
        payment.voidPayment();
        PaymentReceived voidedPayment = paymentReceivedRepository.save(payment);
        
        return convertToDTO(voidedPayment);
    }
    
    public List<PaymentReceivedDTO> getPaymentsByCustomer(Long customerId) {
        return paymentReceivedRepository.findByCustomerId(customerId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<PaymentReceivedDTO> searchPayments(String query) {
        return paymentReceivedRepository.searchPayments(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<PaymentReceivedDTO> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return paymentReceivedRepository.findByPaymentDateBetween(startDate, endDate).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private String generatePaymentNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long count = paymentReceivedRepository.count() + 1;
        return String.format("PAY-%s-%03d", year, count);
    }
    
    private PaymentReceivedDTO convertToDTO(PaymentReceived payment) {
        List<InvoicePaymentDTO> invoicePaymentDTOs = payment.getInvoicePayments().stream()
            .map(this::convertInvoicePaymentToDTO)
            .collect(Collectors.toList());
        
        return PaymentReceivedDTO.builder()
            .id(payment.getId())
            .paymentNumber(payment.getPaymentNumber())
            .referenceNumber(payment.getReferenceNumber())
            .customerId(payment.getCustomerId())
            .paymentDate(payment.getPaymentDate())
            .paymentMode(payment.getPaymentMode() != null ? payment.getPaymentMode().name() : null)
            .depositTo(payment.getDepositTo())
            .amountReceived(payment.getAmountReceived())
            .bankCharges(payment.getBankCharges())
            .taxDeducted(payment.getTaxDeducted())
            .taxAmount(payment.getTaxAmount())
            .amountUsed(payment.getAmountUsed())
            .unusedAmount(payment.getUnusedAmount())
            .status(payment.getStatus() != null ? payment.getStatus().name() : null)
            .type(payment.getType() != null ? payment.getType().name() : null)
            .notes(payment.getNotes())
            .attachments(payment.getAttachments())
            .invoicePayments(invoicePaymentDTOs)
            .createdBy(payment.getCreatedBy())
            .createdAt(payment.getCreatedAt())
            .updatedAt(payment.getUpdatedAt())
            .build();
    }
    
    private InvoicePaymentDTO convertInvoicePaymentToDTO(InvoicePayment invoicePayment) {
        // Fetch invoice to get invoice number
        Invoice invoice = invoiceRepository.findById(invoicePayment.getInvoiceId())
            .orElse(null);
        
        return InvoicePaymentDTO.builder()
            .id(invoicePayment.getId())
            .invoiceId(invoicePayment.getInvoiceId())
            .invoiceNumber(invoice != null ? invoice.getInvoiceNumber() : null)
            .invoiceBalanceDue(invoicePayment.getInvoiceBalanceDue())
            .paymentAmount(invoicePayment.getPaymentAmount())
            .paymentDate(invoicePayment.getPaymentDate())
            .createdAt(invoicePayment.getCreatedAt())
            .build();
    }
    
    private PaymentReceived convertToEntity(PaymentReceivedDTO dto) {
        return PaymentReceived.builder()
            .paymentNumber(dto.getPaymentNumber())
            .referenceNumber(dto.getReferenceNumber())
            .customerId(dto.getCustomerId())
            .paymentDate(dto.getPaymentDate())
            .paymentMode(dto.getPaymentMode() != null ? 
                PaymentReceived.PaymentMode.valueOf(dto.getPaymentMode()) : null)
            .depositTo(dto.getDepositTo())
            .amountReceived(dto.getAmountReceived())
            .bankCharges(dto.getBankCharges())
            .taxDeducted(dto.getTaxDeducted())
            .taxAmount(dto.getTaxAmount())
            .status(dto.getStatus() != null ? 
                PaymentReceived.PaymentStatus.valueOf(dto.getStatus()) : PaymentReceived.PaymentStatus.COMPLETED)
            .notes(dto.getNotes())
            .attachments(dto.getAttachments())
            .createdBy(dto.getCreatedBy())
            .build();
    }
    
    private void updatePaymentFields(PaymentReceived payment, PaymentReceivedDTO dto) {
        payment.setReferenceNumber(dto.getReferenceNumber());
        payment.setCustomerId(dto.getCustomerId());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setPaymentMode(dto.getPaymentMode() != null ? 
            PaymentReceived.PaymentMode.valueOf(dto.getPaymentMode()) : null);
        payment.setDepositTo(dto.getDepositTo());
        payment.setAmountReceived(dto.getAmountReceived());
        payment.setBankCharges(dto.getBankCharges());
        payment.setTaxDeducted(dto.getTaxDeducted());
        payment.setTaxAmount(dto.getTaxAmount());
        payment.setNotes(dto.getNotes());
        payment.setAttachments(dto.getAttachments());
    }
}