package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_receipts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReceipt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String salesReceiptNumber;
    
    @Column(length = 100)
    private String referenceNumber;
    
    @Column(nullable = false)
    private Long customerId;
    
    @Column(nullable = false)
    private LocalDate receiptDate;
    
    @Column(length = 100)
    private String salesPerson;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal shippingCharges = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal total = BigDecimal.ZERO;
    
    // Payment Details
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMode paymentMode = PaymentMode.BANK_TRANSFER;
    
    @Column(length = 200)
    private String depositTo; // Account name where payment is deposited
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesReceiptStatus status = SalesReceiptStatus.DRAFT;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;
    
    @Column(length = 500)
    private String attachments; // JSON array of file names
    
    @OneToMany(mappedBy = "salesReceipt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalesReceiptItem> items = new ArrayList<>();
    
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
    
    public enum PaymentMode {
        CASH, BANK_TRANSFER, CHEQUE, CREDIT_CARD, DEBIT_CARD
    }
    
    public enum SalesReceiptStatus {
        DRAFT, COMPLETED, VOID
    }
    
    // Helper methods
    public void addItem(SalesReceiptItem item) {
        items.add(item);
        item.setSalesReceipt(this);
    }
    
    public void removeItem(SalesReceiptItem item) {
        items.remove(item);
        item.setSalesReceipt(null);
    }
    
    public void voidReceipt() {
        this.status = SalesReceiptStatus.VOID;
    }
}