package com.feed.feedv4.service;

import com.feed.feedv4.dto.InvoiceDTO;
import com.feed.feedv4.dto.InvoiceItemDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.InvoiceItem;
import com.feed.feedv4.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    /* -------------------- CRUD -------------------- */

    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
        return mapToDTO(invoice);
    }

    public InvoiceDTO createInvoice(InvoiceDTO dto) {
        Invoice invoice = mapToEntity(dto);
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setPaymentStatus(Invoice.PaymentStatus.UNPAID);
        if (invoice.getBalanceDue() == null) {
            invoice.setBalanceDue(invoice.getTotal());
        }
        return mapToDTO(invoiceRepository.save(invoice));
    }

    public InvoiceDTO updateInvoice(Long id, InvoiceDTO dto) {
        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
        updateFields(existing, dto);
        return mapToDTO(invoiceRepository.save(existing));
    }

    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    /* -------------------- ACTIONS -------------------- */

    public InvoiceDTO voidInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
        invoice.setStatus(Invoice.InvoiceStatus.VOID);
        return mapToDTO(invoiceRepository.save(invoice));
    }

    public InvoiceDTO cloneInvoice(Long id) {
        Invoice original = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        Invoice clone = Invoice.builder()
                .customerId(original.getCustomerId())
                .customerName(original.getCustomerName())
                .orderNumber(original.getOrderNumber())
                .invoiceDate(original.getInvoiceDate())
                .terms(original.getTerms())
                .dueDate(original.getDueDate())
                .salesPerson(original.getSalesPerson())
                .subject(original.getSubject())
                .shippingCharges(original.getShippingCharges())
                .subtotal(original.getSubtotal())
                .tax(original.getTax())
                .total(original.getTotal())
                .balanceDue(original.getTotal())
                .status(Invoice.InvoiceStatus.DRAFT)
                .paymentStatus(Invoice.PaymentStatus.UNPAID)
                .customerNotes(original.getCustomerNotes())
                .termsAndConditions(original.getTermsAndConditions())
                .build();

        clone.setInvoiceNumber(generateInvoiceNumber());

        original.getItems().forEach(item -> clone.addItem(
                InvoiceItem.builder()
                        .itemName(item.getItemName())
                        .quantity(item.getQuantity())
                        .rate(item.getRate())
                        .tax(item.getTax())
                        .amount(item.getAmount())
                        .sequence(item.getSequence())
                        .build()
        ));

        return mapToDTO(invoiceRepository.save(clone));
    }

    public InvoiceDTO recordPayment(Long id, BigDecimal amount) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        if (invoice.getStatus() == Invoice.InvoiceStatus.VOID) {
            throw new RuntimeException("Cannot record payment on a voided invoice");
        }

        BigDecimal currentBalance = invoice.getBalanceDue() != null
                ? invoice.getBalanceDue()
                : invoice.getTotal();

        if (amount.compareTo(currentBalance) > 0) {
            throw new RuntimeException("Payment amount exceeds balance due");
        }

        BigDecimal newBalance = currentBalance.subtract(amount);
        invoice.setBalanceDue(newBalance);

        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setPaymentStatus(Invoice.PaymentStatus.PAID);
        } else {
            invoice.setPaymentStatus(Invoice.PaymentStatus.PARTIALLY_PAID);
        }

        return mapToDTO(invoiceRepository.save(invoice));
    }

    /* -------------------- MAPPING -------------------- */

    private Invoice mapToEntity(InvoiceDTO dto) {
        Invoice invoice = Invoice.builder()
                .customerId(dto.getCustomerId())
                .customerName(dto.getCustomerName())
                .orderNumber(dto.getOrderNumber())
                .invoiceDate(dto.getInvoiceDate())
                .terms(dto.getTerms())
                .dueDate(dto.getDueDate())
                .salesPerson(dto.getSalesPerson())
                .subject(dto.getSubject())
                .shippingCharges(dto.getShippingCharges())
                .subtotal(dto.getSubtotal())
                .tax(dto.getTax())
                .total(dto.getTotal())
                .balanceDue(dto.getBalanceDue())
                .status(dto.getStatus())
                .paymentStatus(dto.getPaymentStatus())
                .customerNotes(dto.getCustomerNotes())
                .termsAndConditions(dto.getTermsAndConditions())
                .attachments(dto.getAttachments())
                .build();

        if (dto.getItems() != null) {
            dto.getItems().stream()
                    .map(i -> InvoiceItem.builder()
                            .itemName(i.getItemName())
                            .quantity(i.getQuantity())
                            .rate(i.getRate())
                            .tax(i.getTax())
                            .amount(i.getAmount())
                            .sequence(i.getSequence())
                            .build())
                    .forEach(invoice::addItem);
        }

        return invoice;
    }

    private InvoiceDTO mapToDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerId(invoice.getCustomerId())
                .customerName(invoice.getCustomerName())
                .orderNumber(invoice.getOrderNumber())
                .invoiceDate(invoice.getInvoiceDate())
                .terms(invoice.getTerms())
                .dueDate(invoice.getDueDate())
                .salesPerson(invoice.getSalesPerson())
                .subject(invoice.getSubject())
                .shippingCharges(invoice.getShippingCharges())
                .subtotal(invoice.getSubtotal())
                .tax(invoice.getTax())
                .total(invoice.getTotal())
                .balanceDue(invoice.getBalanceDue())
                .status(invoice.getStatus())
                .paymentStatus(invoice.getPaymentStatus())
                .customerNotes(invoice.getCustomerNotes())
                .termsAndConditions(invoice.getTermsAndConditions())
                .attachments(invoice.getAttachments())
                .createdAt(invoice.getCreatedAt())
                .items(invoice.getItems() == null ? List.of() : invoice.getItems().stream()
                        .map(i -> InvoiceItemDTO.builder()
                                .id(i.getId())
                                .itemName(i.getItemName())
                                .quantity(i.getQuantity())
                                .rate(i.getRate())
                                .tax(i.getTax())
                                .amount(i.getAmount())
                                .sequence(i.getSequence())
                                .build())
                        .toList())
                .build();
    }

    private void updateFields(Invoice invoice, InvoiceDTO dto) {
        invoice.setCustomerId(dto.getCustomerId());
        invoice.setCustomerName(dto.getCustomerName());
        invoice.setOrderNumber(dto.getOrderNumber());
        invoice.setInvoiceDate(dto.getInvoiceDate());
        invoice.setTerms(dto.getTerms());
        invoice.setDueDate(dto.getDueDate());
        invoice.setSalesPerson(dto.getSalesPerson());
        invoice.setSubject(dto.getSubject());
        invoice.setShippingCharges(dto.getShippingCharges());
        invoice.setSubtotal(dto.getSubtotal());
        invoice.setTax(dto.getTax());
        invoice.setTotal(dto.getTotal());
        invoice.setBalanceDue(dto.getBalanceDue());
        invoice.setStatus(dto.getStatus());
        invoice.setPaymentStatus(dto.getPaymentStatus());
        invoice.setCustomerNotes(dto.getCustomerNotes());
        invoice.setTermsAndConditions(dto.getTermsAndConditions());
        invoice.setAttachments(dto.getAttachments());

        invoice.getItems().clear();

        if (dto.getItems() != null) {
            dto.getItems().stream()
                    .map(i -> InvoiceItem.builder()
                            .itemName(i.getItemName())
                            .quantity(i.getQuantity())
                            .rate(i.getRate())
                            .tax(i.getTax())
                            .amount(i.getAmount())
                            .sequence(i.getSequence())
                            .build())
                    .forEach(invoice::addItem);
        }
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }
}