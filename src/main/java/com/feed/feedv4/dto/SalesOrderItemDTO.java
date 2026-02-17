package com.feed.feedv4.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrderItemDTO {

    private Long id;

    @NotBlank
    private String itemName;

    @NotNull
    private BigDecimal quantity;

    @NotNull
    private BigDecimal rate;

    private BigDecimal tax;

    private BigDecimal amount;

    private Integer sequence;
}