package com.feed.feedv4.dto;

import com.feed.feedv4.model.SalesOrder.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrderDTO {

    private Long id;

    private String salesOrderNumber;

    private String referenceNumber;

    @NotNull
    private Long customerId;

    private String customerName;

    @NotNull
    private LocalDate salesOrderDate;

    private LocalDate expectedShipmentDate;

    private String paymentTerms;

    private String deliveryMethod;

    private String salesPerson;

    private BigDecimal shippingCharges;

    private BigDecimal subtotal;

    private BigDecimal tax;

    private BigDecimal discount;

    private BigDecimal total;

    private SalesOrderStatus status;

    private OrderStatus orderStatus;

    private InvoicedStatus invoicedStatus;

    private PaymentStatus paymentStatus;

    private String customerNotes;

    private String termsAndConditions;

    private String attachments;

    private List<SalesOrderItemDTO> items;
}