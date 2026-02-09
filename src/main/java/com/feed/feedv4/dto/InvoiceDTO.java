package com.feed.feedv4.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {
    
    private Long id;
    private String invoiceNumber;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private Long salesOrderId;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String paymentTerms;
    private String subject;
    private Boolean taxInclusive;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private String discountType;
    private BigDecimal tax;
    private BigDecimal total;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private String status;
    private String customerNotes;
    private String termsAndConditions;
    private String attachments;
    private List<InvoiceItemDTO> items;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}