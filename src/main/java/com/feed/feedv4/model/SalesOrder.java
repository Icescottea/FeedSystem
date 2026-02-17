package com.feed.feedv4.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sales_orders")
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String salesOrderNumber;

    private String referenceNumber;

    private Long customerId;

    private String customerName;

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

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private SalesOrderStatus status;

    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    private InvoicedStatus invoicedStatus;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(columnDefinition = "TEXT")
    private String customerNotes;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    private String attachments;

    @OneToMany(
            mappedBy = "salesOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )

    @Builder.Default
    private List<SalesOrderItem> items = new ArrayList<>();

    /* ---------------- Helper Methods ---------------- */

    public void addItem(SalesOrderItem item) {
        items.add(item);
        item.setSalesOrder(this);
    }

    public void removeItem(SalesOrderItem item) {
        items.remove(item);
        item.setSalesOrder(null);
    }

    /* ---------------- Enums ---------------- */

    public enum SalesOrderStatus {
        DRAFT, CONFIRMED, VOID
    }

    public enum OrderStatus {
        OPEN, CLOSED, CANCELLED
    }

    public enum InvoicedStatus {
        NOT_INVOICED, PARTIALLY_INVOICED, FULLY_INVOICED
    }

    public enum PaymentStatus {
        UNPAID, PARTIALLY_PAID, PAID
    }
}