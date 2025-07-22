package com.feed.feedv4.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feed.feedv4.dto.FinanceReportDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.repository.InvoiceRepository;
import com.feed.feedv4.repository.PaymentRepository;

@Service
public class FinanceReportService {

    @Autowired InvoiceRepository invoiceRepo;
    @Autowired PaymentRepository paymentRepo;

    public FinanceReportDTO generateReport() {
        FinanceReportDTO dto = new FinanceReportDTO();

        // 1. Revenue by Service
        Map<String, Double> revenueByService = new HashMap<>();
        List<Invoice> invoices = invoiceRepo.findAll();
        for (Invoice inv : invoices) {
            revenueByService.merge(inv.getServiceType(), inv.getAmount(), Double::sum);
        }
        dto.revenueByService = revenueByService;

        // 2. Top Paying Clients
        Map<String, Double> clientPayments = new HashMap<>();
        for (Invoice inv : invoices) {
            clientPayments.merge(inv.getCustomerName(), inv.getAmountPaid(), Double::sum);
        }
        dto.topPayingClients = clientPayments.entrySet().stream()
            .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
            .limit(5)
            .map(Map.Entry::getKey)
            .toList();

        // 3. Avg Cost vs Charge (dummy for now)
        dto.avgCostPerKg = 98.3;
        dto.avgChargePerKg = 112.7;

        // 4. Total Receivables
        dto.totalReceivables = invoices.stream()
            .filter(inv -> !inv.isPaid())
            .mapToDouble(Invoice::getAmount)
            .sum();

        // 5. Monthly Profit Snapshot (last 6 months)
        List<FinanceReportDTO.MonthlyProfitSnapshot> months = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate start = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

            double monthlyRevenue = invoices.stream()
                .filter(inv -> inv.getDateIssued() != null &&
                    !inv.getDateIssued().toLocalDate().isBefore(start) &&
                    !inv.getDateIssued().toLocalDate().isAfter(end))
                .mapToDouble(Invoice::getAmount)
                .sum();

            double estimatedCost = monthlyRevenue * 0.8; // 80% cost assumed
            double profit = monthlyRevenue - estimatedCost;

            FinanceReportDTO.MonthlyProfitSnapshot snap = new FinanceReportDTO.MonthlyProfitSnapshot();
            snap.month = start.getMonth() + " " + start.getYear();
            snap.revenue = monthlyRevenue;
            snap.cost = estimatedCost;
            snap.profit = profit;

            months.add(snap);
        }
        dto.monthlyProfitability = months;

        return dto;
    }
}
