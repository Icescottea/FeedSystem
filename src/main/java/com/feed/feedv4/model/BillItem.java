package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bill_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Bill bill;
    
    @Column(nullable = false, length = 500)
    private String itemDetails;
    
    @Column(nullable = false, length = 100)
    private String account;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal rate = BigDecimal.ZERO;
    
    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal taxRate = BigDecimal.ZERO;
    
    @Column(length = 500)
    private String customerDetails;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private Integer sequence = 0;
    
    // Helper method to calculate amount
    public void calculateAmount() {
        this.amount = this.quantity.multiply(this.rate);
    }
}