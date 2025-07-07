package com.feed.feedv4.dto;

import java.time.LocalDate;

public class InvoiceSummaryDTO {
    private Long customerId;
    private String customerName;
    private String serviceType;
    private double totalInvoiced;
    private double totalPaid;
    private double outstanding;
    private LocalDate invoiceDate;

    public InvoiceSummaryDTO() {}

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public double getTotalInvoiced() {
        return totalInvoiced;
    }

    public void setTotalInvoiced(double totalInvoiced) {
        this.totalInvoiced = totalInvoiced;
    }

    public double getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(double totalPaid) {
        this.totalPaid = totalPaid;
    }

    public double getOutstanding() {
        return outstanding;
    }

    public void setOutstanding(double outstanding) {
        this.outstanding = outstanding;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }
}
