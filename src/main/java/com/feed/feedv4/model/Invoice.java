package com.feed.feedv4.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

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
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    private Long customerId;

    private String customerName;

    private String orderNumber;

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

    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(columnDefinition = "TEXT")
    private String customerNotes;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    private String attachments;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(
            mappedBy = "invoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<InvoiceItem> items = new ArrayList<>();

    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }

    public void removeItem(InvoiceItem item) {
        items.remove(item);
        item.setInvoice(null);
    }

    public void recordPayment(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
    
        if (this.amountPaid == null) {
            this.amountPaid = BigDecimal.ZERO;
        }
    
        this.amountPaid = this.amountPaid.add(amount);
    
        updatePaymentStatus();
    }
    
    public void reversePayment(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Reverse amount must be positive");
        }
    
        if (this.amountPaid == null) {
            this.amountPaid = BigDecimal.ZERO;
        }
    
        this.amountPaid = this.amountPaid.subtract(amount);
    
        if (this.amountPaid.compareTo(BigDecimal.ZERO) < 0) {
            this.amountPaid = BigDecimal.ZERO;
        }
    
        updatePaymentStatus();
    }
    
    public BigDecimal getAmountPaid() {
        return amountPaid == null ? BigDecimal.ZERO : amountPaid;
    }
    
    private void updatePaymentStatus() {
        if (total == null) {
            this.paymentStatus = PaymentStatus.UNPAID;
            return;
        }
    
        if (amountPaid.compareTo(BigDecimal.ZERO) == 0) {
            this.paymentStatus = PaymentStatus.UNPAID;
        } else if (amountPaid.compareTo(total) < 0) {
            this.paymentStatus = PaymentStatus.PARTIALLY_PAID;
        } else {
            this.paymentStatus = PaymentStatus.PAID;
            this.status = InvoiceStatus.SENT;
            this.balanceDue = BigDecimal.ZERO;
        }
    
        if (balanceDue != null) {
            this.balanceDue = total.subtract(amountPaid);
        }
    }

}