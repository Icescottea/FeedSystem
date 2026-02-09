package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quotes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String quoteNumber;
    
    @Column(length = 100)
    private String referenceNumber;
    
    @Column(nullable = false)
    private Long customerId;
    
    @Column(nullable = false)
    private LocalDate quoteDate;
    
    @Column(nullable = false)
    private LocalDate expiryDate;
    
    @Column(length = 500)
    private String subject;
    
    @Column(length = 100)
    private String salesPerson;
    
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
    private BigDecimal adjustment = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal total = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuoteStatus status = QuoteStatus.DRAFT;
    
    @Column(columnDefinition = "TEXT")
    private String customerNotes;
    
    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;
    
    @Column(length = 500)
    private String attachments;
    
    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuoteItem> items = new ArrayList<>();
    
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
        updateStatus();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updateStatus();
    }
    
    public enum DiscountType {
        PERCENTAGE, AMOUNT
    }
    
    public enum QuoteStatus {
        DRAFT, SENT, ACCEPTED, DECLINED, EXPIRED
    }
    
    public void addItem(QuoteItem item) {
        items.add(item);
        item.setQuote(this);
    }
    
    public void removeItem(QuoteItem item) {
        items.remove(item);
        item.setQuote(null);
    }
    
    public void updateStatus() {
        if (this.status != QuoteStatus.ACCEPTED && 
            this.status != QuoteStatus.DECLINED && 
            this.expiryDate != null && 
            this.expiryDate.isBefore(LocalDate.now())) {
            this.status = QuoteStatus.EXPIRED;
        }
    }
    
    public void markAsAccepted() {
        this.status = QuoteStatus.ACCEPTED;
    }
    
    public void markAsDeclined() {
        this.status = QuoteStatus.DECLINED;
    }
}