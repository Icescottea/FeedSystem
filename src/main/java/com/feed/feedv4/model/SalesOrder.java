package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    
    @Column(unique = true, nullable = false, length = 50)
    private String salesOrderNumber;
    
    @Column(length = 100)
    private String referenceNumber;
    
    @Column(nullable = false)
    private Long customerId;
    
    @Column(nullable = false)
    private LocalDate salesOrderDate;
    
    @Column
    private LocalDate expectedShipmentDate;
    
    @Column(nullable = false, length = 20)
    private String paymentTerms = "30"; // Default 30 days
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DeliveryMethod deliveryMethod = DeliveryMethod.COURIER;
    
    @Column(length = 100)
    private String salesPerson;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal shippingCharges = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal total = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesOrderStatus status = SalesOrderStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InvoicedStatus invoicedStatus = InvoicedStatus.NOT_INVOICED;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus orderStatus = OrderStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String customerNotes;
    
    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;
    
    @Column(length = 500)
    private String attachments; // JSON array of file names
    
    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalesOrderItem> items = new ArrayList<>();
    
    @Column(length = 100)
    private String createdBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum DeliveryMethod {
        COURIER, PICKUP, DELIVERY
    }
    
    public enum SalesOrderStatus {
        DRAFT, CONFIRMED, CLOSED, VOID
    }
    
    public enum InvoicedStatus {
        NOT_INVOICED, PARTIALLY_INVOICED, FULLY_INVOICED
    }
    
    public enum PaymentStatus {
        UNPAID, PARTIALLY_PAID, PAID
    }
    
    public enum OrderStatus {
        PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    }
    
    // Helper methods
    public void addItem(SalesOrderItem item) {
        items.add(item);
        item.setSalesOrder(this);
    }
    
    public void removeItem(SalesOrderItem item) {
        items.remove(item);
        item.setSalesOrder(null);
    }
    
    public void voidOrder() {
        this.status = SalesOrderStatus.VOID;
        this.orderStatus = OrderStatus.CANCELLED;
    }
}