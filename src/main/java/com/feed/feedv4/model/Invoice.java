package com.feed.feedv4.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private String customerName;
    private String serviceType;

    // 🔄 Changed from String to Long
    private Long batchId;

    private double amount;
    private String status;
    private LocalDateTime dateIssued;
    private boolean paid;
    private double amountPaid;
    private LocalDateTime paymentDate;
    private LocalDateTime updatedAt;


    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.dateIssued == null) this.dateIssued = now;
        this.updatedAt = now;
        if (this.status == null || this.status.isBlank()) this.status = "Draft"; // or "Unpaid"
        if (this.amountPaid == 0 && this.paid) this.paid = false; // sanity
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 🔽 Setters
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setDateIssued(LocalDateTime dateIssued) {
        this.dateIssued = dateIssued;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    public void setAmountPaid(double amountPaid) {
        this.amountPaid = amountPaid;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // 🔼 Getters
    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getServiceType() {
        return serviceType;
    }

    public Long getBatchId() {
        return batchId;
    }

    public double getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getDateIssued() {
        return dateIssued;
    }

    public boolean isPaid() {
        return paid;
    }

    public double getAmountPaid() {
        return amountPaid;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // 🔁 Helpers
    public double getPaidAmount() {
        return this.amountPaid;
    }

    public double getTotalAmount() {
        return this.amount;
    }
}
