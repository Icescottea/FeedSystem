package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "quote_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Quote quote;
    
    @Column(nullable = false, length = 500)
    private String itemName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal rate = BigDecimal.ZERO;
    
    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal taxRate = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private Integer sequence = 0;
    
    public void calculateAmount() {
        this.amount = this.quantity.multiply(this.rate);
    }
}