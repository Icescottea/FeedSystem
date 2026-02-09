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
public class PaymentReceivedDTO {
    
    private Long id;
    private String paymentNumber;
    private String referenceNumber;
    private Long customerId;
    private String customerName;
    private LocalDate paymentDate;
    private String paymentMode;
    private String depositTo;
    private BigDecimal amountReceived;
    private BigDecimal bankCharges;
    private Boolean taxDeducted;
    private BigDecimal taxAmount;
    private BigDecimal amountUsed;
    private BigDecimal unusedAmount;
    private String status;
    private String type;
    private String notes;
    private String attachments;
    private List<InvoicePaymentDTO> invoicePayments;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}