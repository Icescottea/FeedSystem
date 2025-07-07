package com.feed.feedv4.dto;

import java.time.LocalDate;
import java.util.List;

public class InvoiceWithPaymentsDTO {

    // Invoice core
    private Long invoiceId;
    private String customerName;
    private String customerEmail;
    private LocalDate issuedDate;
    private LocalDate dueDate;
    private double totalAmount;
    private double taxAmount;
    private double discountAmount;
    private double netAmount;
    private String status; // PAID / UNPAID / PARTIAL
    private String serviceType; // FORMULATION / PELLETING / etc.

    // Payments made
    private List<PaymentEntry> payments;

    // Optional notes
    private String remarks;

    // ---------- Nested DTO ----------
    public static class PaymentEntry {
        private Long paymentId;
        private double amountPaid;
        private String method; // CASH / BANK / etc.
        private LocalDate paymentDate;
        private String refCode;

        // Getters & Setters
        public Long getPaymentId() { return paymentId; }
        public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

        public double getAmountPaid() { return amountPaid; }
        public void setAmountPaid(double amountPaid) { this.amountPaid = amountPaid; }

        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }

        public LocalDate getPaymentDate() { return paymentDate; }
        public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

        public String getRefCode() { return refCode; }
        public void setRefCode(String refCode) { this.refCode = refCode; }
    }

    // ---------- Getters & Setters ----------
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public LocalDate getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDate issuedDate) { this.issuedDate = issuedDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public double getTaxAmount() { return taxAmount; }
    public void setTaxAmount(double taxAmount) { this.taxAmount = taxAmount; }

    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }

    public double getNetAmount() { return netAmount; }
    public void setNetAmount(double netAmount) { this.netAmount = netAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public List<PaymentEntry> getPayments() { return payments; }
    public void setPayments(List<PaymentEntry> payments) { this.payments = payments; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
