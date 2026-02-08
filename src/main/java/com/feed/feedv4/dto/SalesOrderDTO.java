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
public class SalesOrderDTO {
    
    private Long id;
    private String salesOrderNumber;
    private String referenceNumber;
    private Long customerId;
    private String customerName;
    private LocalDate salesOrderDate;
    private LocalDate expectedShipmentDate;
    private String paymentTerms;
    private String deliveryMethod;
    private String salesPerson;
    private BigDecimal shippingCharges;
    private BigDecimal subtotal;
    private BigDecimal total;
    private String status;
    private String invoicedStatus;
    private String paymentStatus;
    private String orderStatus;
    private String customerNotes;
    private String termsAndConditions;
    private String attachments;
    private List<SalesOrderItemDTO> items;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}