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
public class PurchaseOrderDTO {
    
    private Long id;
    private String purchaseOrderNumber;
    private String referenceNumber;
    private Long vendorId;
    private String vendorName;
    private LocalDate orderDate;
    private LocalDate deliveryDate;
    private String deliveryAddress;
    private String shipmentPreference;
    private String paymentTerms;
    private Boolean taxInclusive;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private String discountType;
    private BigDecimal tax;
    private BigDecimal total;
    private String status;
    private String billedStatus;
    private String notes;
    private String termsAndConditions;
    private String attachments;
    private List<PurchaseOrderItemDTO> items;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}