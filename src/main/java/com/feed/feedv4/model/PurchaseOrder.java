package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String purchaseOrderNumber;
    
    @Column(length = 100)
    private String referenceNumber;
    
    @Column(nullable = false)
    private Long vendorId;
    
    @Column(nullable = false)
    private LocalDate orderDate;
    
    @Column(nullable = false)
    private LocalDate deliveryDate;
    
    @Column(columnDefinition = "TEXT")
    private String deliveryAddress;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentPreference shipmentPreference = ShipmentPreference.ROAD;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentTerms paymentTerms = PaymentTerms.NET_30;
    
    @Column(nullable = false)
    private Boolean taxInclusive = false;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType = DiscountType.PERCENTAGE;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal tax = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal total = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BilledStatus billedStatus = BilledStatus.NOT_BILLED;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;
    
    @Column(length = 500)
    private String attachments; // JSON array of file names
    
    @Column(length = 100)
    private String createdBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseOrderItem> items = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ShipmentPreference {
        ROAD, AIR, SEA, RAIL
    }
    
    public enum PaymentTerms {
        DUE_ON_RECEIPT, NET_15, NET_30, NET_45, NET_60, NET_90
    }
    
    public enum DiscountType {
        PERCENTAGE, AMOUNT
    }
    
    public enum PurchaseOrderStatus {
        DRAFT, SENT, CONFIRMED, CANCELLED
    }
    
    public enum BilledStatus {
        NOT_BILLED, PARTIALLY_BILLED, FULLY_BILLED
    }
    
    // Helper methods
    public void addItem(PurchaseOrderItem item) {
        items.add(item);
        item.setPurchaseOrder(this);
    }
    
    public void removeItem(PurchaseOrderItem item) {
        items.remove(item);
        item.setPurchaseOrder(null);
    }
}