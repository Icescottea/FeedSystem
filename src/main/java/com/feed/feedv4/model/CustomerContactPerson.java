package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "customer_contact_persons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerContactPerson {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Customer customer;
    
    @Column(nullable = false, length = 100)
    private String firstName;
    
    @Column(length = 100)
    private String lastName;
    
    @Column(length = 200)
    private String email;
    
    @Column(length = 50)
    private String phone;
    
    @Column(length = 50)
    private String mobile;
    
    @Column(length = 100)
    private String designation;
    
    @Column(nullable = false)
    private Integer sequence = 0;
}