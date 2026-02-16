package com.feed.feedv4.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrderItemDTO {

    private Long id;
    private String itemName;

    private BigDecimal quantity;
    private BigDecimal rate;
    private BigDecimal tax;
    private BigDecimal amount;

    private Integer sequence;
}