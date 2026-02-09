package com.feed.feedv4.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.feed.feedv4.dto.InvoiceDTO;
import com.feed.feedv4.dto.InvoiceItemDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.InvoiceItem;
import com.feed.feedv4.repository.InvoiceItemRepository;
import com.feed.feedv4.repository.InvoiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {
    
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        return convertToDTO(invoice);
    }
    
    public List<InvoiceDTO> getOutstandingInvoicesByCustomer(Long customerId) {
        return invoiceRepository.findOutstandingInvoicesByCustomerId(customerId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public InvoiceDTO createInvoice(InvoiceDTO dto) {
        if (dto.getInvoiceNumber() == null || dto.getInvoiceNumber().isEmpty()) {
            dto.setInvoiceNumber(generateInvoiceNumber());
        }
        
        if (invoiceRepository.existsByInvoiceNumber(dto.getInvoiceNumber())) {
            throw new RuntimeException("Invoice number " + dto.getInvoiceNumber() + " already exists");
        }
        
        Invoice invoice = convertToEntity(dto);
        
        // Auto-calculate due date if not provided
        if (invoice.getDueDate() == null && invoice.getPaymentTerms() != null) {
            invoice.setDueDate(calculateDueDate(invoice.getInvoiceDate(), invoice.getPaymentTerms()));
        }
        
        calculateTotals(invoice);
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return convertToDTO(savedInvoice);
    }
    
    public InvoiceDTO updateInvoice(Long id, InvoiceDTO dto) {
        Invoice existingInvoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        
        updateInvoiceFields(existingInvoice, dto);
        calculateTotals(existingInvoice);
        
        Invoice updatedInvoice = invoiceRepository.save(existingInvoice);
        return convertToDTO(updatedInvoice);
    }
    
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        
        if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot delete invoice with payments. Please void the invoice instead.");
        }
        
        invoiceRepository.delete(invoice);
    }
    
    public InvoiceDTO voidInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        
        if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot void invoice with payments. Please reverse payments first.");
        }
        
        invoice.voidInvoice();
        Invoice voidedInvoice = invoiceRepository.save(invoice);
        
        return convertToDTO(voidedInvoice);
    }
    
    public InvoiceDTO cloneInvoice(Long id) {
        Invoice original = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        
        Invoice cloned = Invoice.builder()
            .invoiceNumber(generateInvoiceNumber())
            .customerId(original.getCustomerId())
            .invoiceDate(LocalDate.now())
            .paymentTerms(original.getPaymentTerms())
            .subject(original.getSubject())
            .taxInclusive(original.getTaxInclusive())
            .discount(original.getDiscount())
            .discountType(original.getDiscountType())
            .customerNotes(original.getCustomerNotes())
            .termsAndConditions(original.getTermsAndConditions())
            .status(Invoice.InvoiceStatus.DRAFT)
            .build();
        
        cloned.setDueDate(calculateDueDate(cloned.getInvoiceDate(), cloned.getPaymentTerms()));
        
        for (InvoiceItem item : original.getItems()) {
            InvoiceItem clonedItem = InvoiceItem.builder()
                .itemDetails(item.getItemDetails())
                .account(item.getAccount())
                .quantity(item.getQuantity())
                .rate(item.getRate())
                .taxRate(item.getTaxRate())
                .amount(item.getAmount())
                .sequence(item.getSequence())
                .build();
            cloned.addItem(clonedItem);
        }
        
        calculateTotals(cloned);
        Invoice savedInvoice = invoiceRepository.save(cloned);
        
        return convertToDTO(savedInvoice);
    }
    
    public InvoiceDTO recordPayment(Long invoiceId, BigDecimal amount) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        
        if (amount.compareTo(invoice.getBalanceDue()) > 0) {
            throw new RuntimeException("Payment amount cannot exceed balance due");
        }
        
        invoice.recordPayment(amount);
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        
        return convertToDTO(updatedInvoice);
    }
    
    public InvoiceDTO reversePayment(Long invoiceId, BigDecimal amount) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        
        invoice.reversePayment(amount);
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        
        return convertToDTO(updatedInvoice);
    }
    
    public List<InvoiceDTO> getOverdueInvoices() {
        return invoiceRepository.findOverdueInvoices(LocalDate.now()).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<InvoiceDTO> searchInvoices(String query) {
        return invoiceRepository.searchInvoices(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private LocalDate calculateDueDate(LocalDate invoiceDate, Invoice.PaymentTerms terms) {
        if (terms == null) return invoiceDate;
        
        switch (terms) {
            case DUE_ON_RECEIPT: return invoiceDate;
            case NET_15: return invoiceDate.plusDays(15);
            case NET_30: return invoiceDate.plusDays(30);
            case NET_45: return invoiceDate.plusDays(45);
            case NET_60: return invoiceDate.plusDays(60);
            case NET_90: return invoiceDate.plusDays(90);
            default: return invoiceDate.plusDays(30);
        }
    }
    
    private void calculateTotals(Invoice invoice) {
        BigDecimal subtotal = invoice.getItems().stream()
            .map(item -> {
                item.calculateAmount();
                return item.getAmount();
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        invoice.setSubtotal(subtotal);
        
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (invoice.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            if (invoice.getDiscountType() == Invoice.DiscountType.PERCENTAGE) {
                discountAmount = subtotal.multiply(invoice.getDiscount()).divide(new BigDecimal("100"));
            } else {
                discountAmount = invoice.getDiscount();
            }
        }
        
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        
        BigDecimal taxAmount = BigDecimal.ZERO;
        if (!invoice.getTaxInclusive()) {
            taxAmount = invoice.getItems().stream()
                .map(item -> item.getAmount().multiply(item.getTaxRate()).divide(new BigDecimal("100")))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        invoice.setTax(taxAmount);
        invoice.setTotal(afterDiscount.add(taxAmount));
    }
    
    private String generateInvoiceNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long count = invoiceRepository.count() + 1;
        return String.format("INV-%s-%03d", year, count);
    }
    
    private InvoiceDTO convertToDTO(Invoice invoice) {
        List<InvoiceItemDTO> itemDTOs = invoice.getItems().stream()
            .map(this::convertItemToDTO)
            .collect(Collectors.toList());
        
        return InvoiceDTO.builder()
            .id(invoice.getId())
            .invoiceNumber(invoice.getInvoiceNumber())
            .orderNumber(invoice.getOrderNumber())
            .customerId(invoice.getCustomerId())
            .salesOrderId(invoice.getSalesOrderId())
            .invoiceDate(invoice.getInvoiceDate())
            .dueDate(invoice.getDueDate())
            .paymentTerms(invoice.getPaymentTerms() != null ? invoice.getPaymentTerms().name() : null)
            .subject(invoice.getSubject())
            .taxInclusive(invoice.getTaxInclusive())
            .subtotal(invoice.getSubtotal())
            .discount(invoice.getDiscount())
            .discountType(invoice.getDiscountType() != null ? invoice.getDiscountType().name() : null)
            .tax(invoice.getTax())
            .total(invoice.getTotal())
            .amountPaid(invoice.getAmountPaid())
            .balanceDue(invoice.getBalanceDue())
            .status(invoice.getStatus() != null ? invoice.getStatus().name() : null)
            .customerNotes(invoice.getCustomerNotes())
            .termsAndConditions(invoice.getTermsAndConditions())
            .attachments(invoice.getAttachments())
            .items(itemDTOs)
            .createdBy(invoice.getCreatedBy())
            .createdAt(invoice.getCreatedAt())
            .updatedAt(invoice.getUpdatedAt())
            .build();
    }
    
    private InvoiceItemDTO convertItemToDTO(InvoiceItem item) {
        return InvoiceItemDTO.builder()
            .id(item.getId())
            .itemDetails(item.getItemDetails())
            .account(item.getAccount())
            .quantity(item.getQuantity())
            .rate(item.getRate())
            .taxRate(item.getTaxRate())
            .amount(item.getAmount())
            .sequence(item.getSequence())
            .build();
    }
    
    private Invoice convertToEntity(InvoiceDTO dto) {
        Invoice invoice = Invoice.builder()
            .invoiceNumber(dto.getInvoiceNumber())
            .orderNumber(dto.getOrderNumber())
            .customerId(dto.getCustomerId())
            .salesOrderId(dto.getSalesOrderId())
            .invoiceDate(dto.getInvoiceDate())
            .dueDate(dto.getDueDate())
            .paymentTerms(dto.getPaymentTerms() != null ? Invoice.PaymentTerms.valueOf(dto.getPaymentTerms()) : null)
            .subject(dto.getSubject())
            .taxInclusive(dto.getTaxInclusive())
            .discount(dto.getDiscount())
            .discountType(dto.getDiscountType() != null ? Invoice.DiscountType.valueOf(dto.getDiscountType()) : null)
            .status(dto.getStatus() != null ? Invoice.InvoiceStatus.valueOf(dto.getStatus()) : Invoice.InvoiceStatus.DRAFT)
            .customerNotes(dto.getCustomerNotes())
            .termsAndConditions(dto.getTermsAndConditions())
            .attachments(dto.getAttachments())
            .createdBy(dto.getCreatedBy())
            .build();
        
        if (dto.getItems() != null) {
            for (InvoiceItemDTO itemDTO : dto.getItems()) {
                InvoiceItem item = convertItemToEntity(itemDTO);
                invoice.addItem(item);
            }
        }
        
        return invoice;
    }
    
    private InvoiceItem convertItemToEntity(InvoiceItemDTO dto) {
        return InvoiceItem.builder()
            .itemDetails(dto.getItemDetails())
            .account(dto.getAccount())
            .quantity(dto.getQuantity())
            .rate(dto.getRate())
            .taxRate(dto.getTaxRate())
            .amount(dto.getAmount())
            .sequence(dto.getSequence())
            .build();
    }
    
    private void updateInvoiceFields(Invoice invoice, InvoiceDTO dto) {
        invoice.setOrderNumber(dto.getOrderNumber());
        invoice.setCustomerId(dto.getCustomerId());
        invoice.setSalesOrderId(dto.getSalesOrderId());
        invoice.setInvoiceDate(dto.getInvoiceDate());
        invoice.setDueDate(dto.getDueDate());
        invoice.setPaymentTerms(dto.getPaymentTerms() != null ? Invoice.PaymentTerms.valueOf(dto.getPaymentTerms()) : null);
        invoice.setSubject(dto.getSubject());
        invoice.setTaxInclusive(dto.getTaxInclusive());
        invoice.setDiscount(dto.getDiscount());
        invoice.setDiscountType(dto.getDiscountType() != null ? Invoice.DiscountType.valueOf(dto.getDiscountType()) : null);
        invoice.setCustomerNotes(dto.getCustomerNotes());
        invoice.setTermsAndConditions(dto.getTermsAndConditions());
        invoice.setAttachments(dto.getAttachments());
        
        invoice.getItems().clear();
        if (dto.getItems() != null) {
            for (InvoiceItemDTO itemDTO : dto.getItems()) {
                InvoiceItem item = convertItemToEntity(itemDTO);
                invoice.addItem(item);
            }
        }
    }
}