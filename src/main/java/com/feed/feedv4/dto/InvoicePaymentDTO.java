package com.feed.feedv4.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoicePaymentDTO {
    
    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private BigDecimal invoiceBalanceDue;
    private BigDecimal paymentAmount;
    private LocalDate paymentDate;
    private LocalDateTime createdAt;
}