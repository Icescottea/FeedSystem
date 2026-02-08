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
public class ExpenseDTO {
    
    private Long id;
    private LocalDate date;
    private String expenseAccount;
    private String referenceNumber;
    private Long vendorId;
    private String vendorName;
    private String paidThrough;
    private Long customerId;
    private String customerName;
    private BigDecimal amount;
    private Boolean taxInclusive;
    private BigDecimal tax;
    private BigDecimal netAmount;
    private String status;
    private String notes;
    private String department;
    private String location;
    private String attachments;
    private List<ExpenseAccountingEntryDTO> accountingEntries;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}