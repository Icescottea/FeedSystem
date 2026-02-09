package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String invoiceNumber;
    
    @Column(length = 100)
    private String orderNumber;
    
    @Column(nullable = false)
    private Long customerId;
    
    @Column
    private Long salesOrderId; // Reference to sales order if created from SO
    
    @Column(nullable = false)
    private LocalDate invoiceDate;
    
    @Column(nullable = false)
    private LocalDate dueDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentTerms paymentTerms = PaymentTerms.NET_30;
    
    @Column(length = 500)
    private String subject;
    
    @Column(nullable = false)
    private Boolean taxInclusive = false;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType discountType = DiscountType.PERCENTAGE;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal tax = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal total = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amountPaid = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal balanceDue = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.DRAFT;
    
    @Column(columnDefinition = "TEXT")
    private String customerNotes;
    
    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;
    
    @Column(length = 500)
    private String attachments; // JSON array of file names
    
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InvoiceItem> items = new ArrayList<>();
    
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
        calculateBalanceDue();
        updateStatus();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateBalanceDue();
        updateStatus();
    }
    
    public enum PaymentTerms {
        DUE_ON_RECEIPT, NET_15, NET_30, NET_45, NET_60, NET_90
    }
    
    public enum DiscountType {
        PERCENTAGE, AMOUNT
    }
    
    public enum InvoiceStatus {
        DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, VOID
    }
    
    // Helper methods
    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }
    
    public void removeItem(InvoiceItem item) {
        items.remove(item);
        item.setInvoice(null);
    }
    
    public void calculateBalanceDue() {
        this.balanceDue = this.total.subtract(this.amountPaid);
    }
    
    public void updateStatus() {
        if (this.status == InvoiceStatus.VOID) {
            return; // Don't change void status
        }
        
        if (this.balanceDue.compareTo(BigDecimal.ZERO) == 0 && this.total.compareTo(BigDecimal.ZERO) > 0) {
            this.status = InvoiceStatus.PAID;
        } else if (this.amountPaid.compareTo(BigDecimal.ZERO) > 0 && this.balanceDue.compareTo(BigDecimal.ZERO) > 0) {
            this.status = InvoiceStatus.PARTIALLY_PAID;
        } else if (this.dueDate.isBefore(LocalDate.now()) && this.balanceDue.compareTo(BigDecimal.ZERO) > 0) {
            this.status = InvoiceStatus.OVERDUE;
        } else if (this.status == InvoiceStatus.DRAFT) {
            // Keep as draft
        } else {
            this.status = InvoiceStatus.SENT;
        }
    }
    
    public void recordPayment(BigDecimal paymentAmount) {
        this.amountPaid = this.amountPaid.add(paymentAmount);
        calculateBalanceDue();
        updateStatus();
    }
    
    public void reversePayment(BigDecimal paymentAmount) {
        this.amountPaid = this.amountPaid.subtract(paymentAmount);
        if (this.amountPaid.compareTo(BigDecimal.ZERO) < 0) {
            this.amountPaid = BigDecimal.ZERO;
        }
        calculateBalanceDue();
        updateStatus();
    }
    
    public void voidInvoice() {
        this.status = InvoiceStatus.VOID;
    }
}