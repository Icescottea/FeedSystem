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
public class QuoteDTO {
    
    private Long id;
    private String quoteNumber;
    private String referenceNumber;
    private Long customerId;
    private String customerName;
    private LocalDate quoteDate;
    private LocalDate expiryDate;
    private String subject;
    private String salesPerson;
    private Boolean taxInclusive;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private String discountType;
    private BigDecimal tax;
    private BigDecimal adjustment;
    private BigDecimal total;
    private String status;
    private String customerNotes;
    private String termsAndConditions;
    private String attachments;
    private List<QuoteItemDTO> items;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}