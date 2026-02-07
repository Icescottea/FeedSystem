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
public class PurchaseOrderItemDTO {
    
    private Long id;
    private String itemDetails;
    private String account;
    private BigDecimal quantity;
    private BigDecimal rate;
    private BigDecimal taxRate;
    private BigDecimal amount;
    private Integer sequence;
}