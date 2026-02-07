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
public class PaymentMadeDTO {
    
    private Long id;
    private String paymentNumber;
    private String referenceNumber;
    private String orderNumber;
    private Long vendorId;
    private String vendorName;
    private LocalDate paymentDate;
    private String paymentMode;
    private Long paidThroughAccountId;
    private String paidThroughAccountName;
    private BigDecimal paymentMade;
    private BigDecimal bankCharges;
    private BigDecimal amountPaid;
    private BigDecimal amountUsed;
    private BigDecimal amountRefunded;
    private BigDecimal amountInExcess;
    private String status;
    private String notes;
    private String attachments;
    private List<BillPaymentDTO> billPayments;
    private List<AccountingEntryDTO> accountingEntries;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}