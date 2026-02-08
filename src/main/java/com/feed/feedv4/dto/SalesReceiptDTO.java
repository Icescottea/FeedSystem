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
public class SalesReceiptDTO {
    
    private Long id;
    private String salesReceiptNumber;
    private String referenceNumber;
    private Long customerId;
    private String customerName;
    private LocalDate receiptDate;
    private String salesPerson;
    private BigDecimal shippingCharges;
    private BigDecimal subtotal;
    private BigDecimal total;
    private String paymentMode;
    private String depositTo;
    private String status;
    private String notes;
    private String termsAndConditions;
    private String attachments;
    private List<SalesReceiptItemDTO> items;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}