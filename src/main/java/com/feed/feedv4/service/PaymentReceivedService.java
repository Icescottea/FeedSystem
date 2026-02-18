package com.feed.feedv4.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.feed.feedv4.dto.InvoicePaymentDTO;
import com.feed.feedv4.dto.PaymentReceivedDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.InvoicePayment;
import com.feed.feedv4.model.PaymentReceived;
import com.feed.feedv4.repository.InvoicePaymentRepository;
import com.feed.feedv4.repository.InvoiceRepository;
import com.feed.feedv4.repository.PaymentReceivedRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentReceivedService {

    private final PaymentReceivedRepository paymentReceivedRepository;
    private final InvoicePaymentRepository invoicePaymentRepository;
    private final InvoiceRepository invoiceRepository;

    // ─── READ ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PaymentReceivedDTO> getAllPayments() {
        return paymentReceivedRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentReceivedDTO getPaymentById(Long id) {
        return convertToDTO(findById(id));
    }

    @Transactional(readOnly = true)
    public List<PaymentReceivedDTO> getPaymentsByCustomer(Long customerId) {
        return paymentReceivedRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentReceivedDTO> searchPayments(String query) {
        return paymentReceivedRepository.searchPayments(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentReceivedDTO> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return paymentReceivedRepository.findByPaymentDateBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ─── NEXT PAYMENT NUMBER ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public String generatePaymentNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long count = paymentReceivedRepository.count() + 1;
        return String.format("PAY-%s-%03d", year, count);
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    public PaymentReceivedDTO createPayment(PaymentReceivedDTO dto) {
        // Auto-generate payment number if not provided
        if (dto.getPaymentNumber() == null || dto.getPaymentNumber().isBlank()) {
            dto.setPaymentNumber(generatePaymentNumber());
        }

        if (paymentReceivedRepository.existsByPaymentNumber(dto.getPaymentNumber())) {
            throw new RuntimeException("Payment number " + dto.getPaymentNumber() + " already exists");
        }

        if (dto.getAmountReceived() == null || dto.getAmountReceived().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount received must be greater than zero");
        }

        PaymentReceived payment = convertToEntity(dto);

        if (dto.getInvoicePayments() != null && !dto.getInvoicePayments().isEmpty()) {
            for (InvoicePaymentDTO ipDTO : dto.getInvoicePayments()) {
                Invoice invoice = invoiceRepository.findById(ipDTO.getInvoiceId())
                        .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + ipDTO.getInvoiceId()));

                if (ipDTO.getPaymentAmount().compareTo(invoice.getBalanceDue()) > 0) {
                    throw new RuntimeException(
                            "Payment amount cannot exceed invoice balance due for invoice: " + invoice.getInvoiceNumber());
                }

                InvoicePayment invoicePayment = InvoicePayment.builder()
                        .invoiceId(ipDTO.getInvoiceId())
                        .invoiceBalanceDue(invoice.getBalanceDue())
                        .paymentAmount(ipDTO.getPaymentAmount())
                        .paymentDate(payment.getPaymentDate())
                        .build();

                payment.addInvoicePayment(invoicePayment);

                invoice.recordPayment(ipDTO.getPaymentAmount());
                invoiceRepository.save(invoice);
            }
        }

        return convertToDTO(paymentReceivedRepository.save(payment));
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    public PaymentReceivedDTO updatePayment(Long id, PaymentReceivedDTO dto) {
        PaymentReceived existing = findById(id);

        if (existing.getStatus() == PaymentReceived.PaymentStatus.VOID) {
            throw new RuntimeException("Cannot update a voided payment");
        }

        // Reverse old invoice payments
        for (InvoicePayment ip : existing.getInvoicePayments()) {
            Invoice invoice = invoiceRepository.findById(ip.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + ip.getInvoiceId()));
            invoice.reversePayment(ip.getPaymentAmount());
            invoiceRepository.save(invoice);
        }

        // orphanRemoval handles DB deletion of old InvoicePayment rows
        existing.getInvoicePayments().clear();

        updatePaymentFields(existing, dto);

        if (dto.getInvoicePayments() != null && !dto.getInvoicePayments().isEmpty()) {
            for (InvoicePaymentDTO ipDTO : dto.getInvoicePayments()) {
                Invoice invoice = invoiceRepository.findById(ipDTO.getInvoiceId())
                        .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + ipDTO.getInvoiceId()));

                if (ipDTO.getPaymentAmount().compareTo(invoice.getBalanceDue()) > 0) {
                    throw new RuntimeException(
                            "Payment amount cannot exceed invoice balance due for invoice: " + invoice.getInvoiceNumber());
                }

                InvoicePayment invoicePayment = InvoicePayment.builder()
                        .invoiceId(ipDTO.getInvoiceId())
                        .invoiceBalanceDue(invoice.getBalanceDue())
                        .paymentAmount(ipDTO.getPaymentAmount())
                        .paymentDate(existing.getPaymentDate())
                        .build();

                existing.addInvoicePayment(invoicePayment);

                invoice.recordPayment(ipDTO.getPaymentAmount());
                invoiceRepository.save(invoice);
            }
        }

        return convertToDTO(paymentReceivedRepository.save(existing));
    }

    // ─── VOID ────────────────────────────────────────────────────────────────

    public PaymentReceivedDTO voidPayment(Long id) {
        PaymentReceived payment = findById(id);

        if (payment.getStatus() == PaymentReceived.PaymentStatus.VOID) {
            throw new RuntimeException("Payment is already voided");
        }

        for (InvoicePayment ip : payment.getInvoicePayments()) {
            Invoice invoice = invoiceRepository.findById(ip.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + ip.getInvoiceId()));
            invoice.reversePayment(ip.getPaymentAmount());
            invoiceRepository.save(invoice);
        }

        payment.voidPayment();
        return convertToDTO(paymentReceivedRepository.save(payment));
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────

    public void deletePayment(Long id) {
        PaymentReceived payment = findById(id);

        if (!payment.getInvoicePayments().isEmpty()) {
            throw new RuntimeException(
                    "Cannot delete a payment that has been applied to invoices. Please void it first.");
        }

        paymentReceivedRepository.delete(payment);
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private PaymentReceived findById(Long id) {
        return paymentReceivedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    // ─── MAPPING ─────────────────────────────────────────────────────────────

    private PaymentReceivedDTO convertToDTO(PaymentReceived payment) {
        List<InvoicePaymentDTO> invoicePaymentDTOs = payment.getInvoicePayments().stream()
                .map(this::convertInvoicePaymentToDTO)
                .collect(Collectors.toList());

        return PaymentReceivedDTO.builder()
                .id(payment.getId())
                .paymentNumber(payment.getPaymentNumber())
                .referenceNumber(payment.getReferenceNumber())
                .customerId(payment.getCustomerId())
                // customerName not stored on PaymentReceived — not mapped
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

    private InvoicePaymentDTO convertInvoicePaymentToDTO(InvoicePayment ip) {
        // invoiceNumber is not stored on InvoicePayment — fetch from Invoice
        Invoice invoice = invoiceRepository.findById(ip.getInvoiceId()).orElse(null);

        return InvoicePaymentDTO.builder()
                .id(ip.getId())
                .invoiceId(ip.getInvoiceId())
                .invoiceNumber(invoice != null ? invoice.getInvoiceNumber() : null)
                .invoiceBalanceDue(ip.getInvoiceBalanceDue())
                .paymentAmount(ip.getPaymentAmount())
                .paymentDate(ip.getPaymentDate())
                .createdAt(ip.getCreatedAt())
                .build();
    }

    private PaymentReceived convertToEntity(PaymentReceivedDTO dto) {
        return PaymentReceived.builder()
                .paymentNumber(dto.getPaymentNumber())
                .referenceNumber(dto.getReferenceNumber())
                .customerId(dto.getCustomerId())
                .paymentDate(dto.getPaymentDate())
                .paymentMode(dto.getPaymentMode() != null
                        ? PaymentReceived.PaymentMode.valueOf(dto.getPaymentMode())
                        : PaymentReceived.PaymentMode.BANK_TRANSFER)
                .depositTo(dto.getDepositTo())
                .amountReceived(dto.getAmountReceived() != null ? dto.getAmountReceived() : BigDecimal.ZERO)
                .bankCharges(dto.getBankCharges() != null ? dto.getBankCharges() : BigDecimal.ZERO)
                .taxDeducted(dto.getTaxDeducted() != null ? dto.getTaxDeducted() : false)
                .taxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO)
                .amountUsed(BigDecimal.ZERO)
                .unusedAmount(BigDecimal.ZERO)
                .status(PaymentReceived.PaymentStatus.COMPLETED)
                .type(PaymentReceived.PaymentType.INVOICE_PAYMENT)
                .notes(dto.getNotes())
                .attachments(dto.getAttachments())
                .createdBy(dto.getCreatedBy())
                .build();
    }

    private void updatePaymentFields(PaymentReceived payment, PaymentReceivedDTO dto) {
        payment.setReferenceNumber(dto.getReferenceNumber());
        payment.setCustomerId(dto.getCustomerId());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setPaymentMode(dto.getPaymentMode() != null
                ? PaymentReceived.PaymentMode.valueOf(dto.getPaymentMode())
                : PaymentReceived.PaymentMode.BANK_TRANSFER);
        payment.setDepositTo(dto.getDepositTo());
        payment.setAmountReceived(dto.getAmountReceived() != null ? dto.getAmountReceived() : BigDecimal.ZERO);
        payment.setBankCharges(dto.getBankCharges() != null ? dto.getBankCharges() : BigDecimal.ZERO);
        payment.setTaxDeducted(dto.getTaxDeducted() != null ? dto.getTaxDeducted() : false);
        payment.setTaxAmount(dto.getTaxAmount() != null ? dto.getTaxAmount() : BigDecimal.ZERO);
        payment.setNotes(dto.getNotes());
        payment.setAttachments(dto.getAttachments());
    }
}