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
public class ExpenseAccountingEntryDTO {
    
    private Long id;
    private String account;
    private BigDecimal debit;
    private BigDecimal credit;
    private Integer sequence;
}