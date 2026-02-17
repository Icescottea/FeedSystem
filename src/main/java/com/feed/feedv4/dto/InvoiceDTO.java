package com.feed.feedv4.dto;

import com.feed.feedv4.model.Invoice.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {

    private Long id;

    private String invoiceNumber;

    @NotNull
    private Long customerId;

    private String customerName;

    private String orderNumber;

    @NotNull
    private LocalDate invoiceDate;

    private String terms;

    private LocalDate dueDate;

    private String salesPerson;

    private String subject;

    private BigDecimal shippingCharges;

    private BigDecimal subtotal;

    private BigDecimal tax;

    private BigDecimal total;

    private BigDecimal balanceDue;

    private InvoiceStatus status;

    private PaymentStatus paymentStatus;

    private String customerNotes;

    private String termsAndConditions;

    private String attachments;

    private LocalDateTime createdAt;

    private List<InvoiceItemDTO> items;
}