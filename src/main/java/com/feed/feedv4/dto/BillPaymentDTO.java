package com.feed.feedv4.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillPaymentDTO {
    
    private Long id;
    private Long billId;
    private String billNumber;
    private String poNumber;
    private LocalDate billDate;
    private BigDecimal billAmount;
    private BigDecimal amountDue;
    private LocalDate paymentDate;
    private BigDecimal paymentAmount;
}