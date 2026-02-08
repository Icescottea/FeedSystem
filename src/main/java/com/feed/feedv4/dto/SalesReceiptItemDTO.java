package com.feed.feedv4.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReceiptItemDTO {
    
    private Long id;
    private String itemName;
    private BigDecimal quantity;
    private BigDecimal rate;
    private BigDecimal tax;
    private BigDecimal amount;
    private Integer sequence;
}