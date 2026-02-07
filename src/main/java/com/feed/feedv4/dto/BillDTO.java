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
public class BillDTO {
    
    private Long id;
    private String billNumber;
    private String orderNumber;
    private String referenceNumber;
    private Long vendorId;
    private String vendorName;
    private LocalDate billDate;
    private LocalDate dueDate;
    private String paymentTerms;
    private String accountsPayable;
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
    private String notes;
    private String attachments;
    private List<BillItemDTO> items;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}