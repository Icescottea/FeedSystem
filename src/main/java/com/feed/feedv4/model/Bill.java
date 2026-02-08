package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String billNumber;
    
    @Column(length = 100)
    private String orderNumber;
    
    @Column(length = 100)
    private String referenceNumber;
    
    @Column(nullable = false)
    private Long vendorId;
    
    @Column(nullable = false)
    private LocalDate billDate;
    
    @Column(nullable = false)
    private LocalDate dueDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentTerms paymentTerms = PaymentTerms.NET_30;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountsPayable accountsPayable = AccountsPayable.ACCOUNTS_PAYABLE;
    
    @Column(length = 500)
    private String subject;
    
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
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amountPaid = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal balanceDue = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillStatus status = BillStatus.DRAFT;

    private BigDecimal outstandingAmount;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(length = 500)
    private String attachments; // JSON array of file names
    
    @Column(length = 100)
    private String createdBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BillItem> items = new ArrayList<>();
    
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
    
    public enum AccountsPayable {
        ACCOUNTS_PAYABLE, TRADE_PAYABLES, OTHER_PAYABLES
    }
    
    public enum DiscountType {
        PERCENTAGE, AMOUNT
    }
    
    public enum BillStatus {
        DRAFT, OPEN, PARTIALLY_PAID, PAID, OVERDUE, VOID
    }
    
    // Helper methods
    public void addItem(BillItem item) {
        items.add(item);
        item.setBill(this);
    }
    
    public void removeItem(BillItem item) {
        items.remove(item);
        item.setBill(null);
    }
    
    public void calculateBalanceDue() {
        this.balanceDue = this.total.subtract(this.amountPaid);
    }
    
    public void updateStatus() {
        if (this.status == BillStatus.VOID) {
            return; // Don't change void status
        }
        
        if (this.balanceDue.compareTo(BigDecimal.ZERO) == 0 && this.total.compareTo(BigDecimal.ZERO) > 0) {
            this.status = BillStatus.PAID;
        } else if (this.amountPaid.compareTo(BigDecimal.ZERO) > 0 && this.balanceDue.compareTo(BigDecimal.ZERO) > 0) {
            this.status = BillStatus.PARTIALLY_PAID;
        } else if (this.dueDate.isBefore(LocalDate.now()) && this.balanceDue.compareTo(BigDecimal.ZERO) > 0) {
            this.status = BillStatus.OVERDUE;
        } else if (this.status == BillStatus.DRAFT) {
            // Keep as draft
        } else {
            this.status = BillStatus.OPEN;
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
    
    public void voidBill() {
        this.status = BillStatus.VOID;
    }
}