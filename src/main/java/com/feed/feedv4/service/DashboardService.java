package com.feed.feedv4.service;

import com.feed.feedv4.dto.DashboardSummaryDTO;
import com.feed.feedv4.model.RawMaterial;
import com.feed.feedv4.model.Role;
import com.feed.feedv4.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private FormulationRepository formulationRepo;

    @Autowired
    private PelletingBatchRepository pelletingRepo;

    @Autowired
    private RawMaterialRepository rawMaterialRepo;

    @Autowired
    private InvoiceRepository invoiceRepo;

    @Autowired
    private PaymentRepository paymentRepo;

    public DashboardSummaryDTO getDashboardByRole(Role role) {
        System.out.println("Dashboard requested for role: " + role);
        DashboardSummaryDTO dto = new DashboardSummaryDTO();
        dto.setSnapshotDate(LocalDate.now());

        List<String> alerts = new ArrayList<>();
        List<String> activityLog = new ArrayList<>();

        // --- Shared Smart Alerts ---
        if (formulationRepo.countByCreatedAtAfter(LocalDate.now().minusDays(3).atStartOfDay()) == 0) {
            alerts.add("⚠️ No formulations in the last 3 days.");
        }

        // --- For Formulators / Admin ---
        if (role == Role.ADMIN || role == Role.FORMULATOR) {
            int todayFormulations = formulationRepo.countByCreatedAtAfter(LocalDate.now().atStartOfDay());
            dto.setTodaysFormulations(todayFormulations);

            // Assume avg cost/kg stubbed at 102.3
            dto.setAvgCostPerKgLast30Days(102.3);
            dto.setTopUsedRawMaterial("Maize");

            if (dto.getAvgCostPerKgLast30Days() > 110) {
                alerts.add("⚠️ Average cost per kg exceeds threshold.");
            }
        }

        // --- For Pelleting Operators ---
        if (role == Role.ADMIN || role == Role.OPERATOR) {
            int pendingJobs = pelletingRepo.countByStatus("Not Started");
            dto.setPendingPelletingJobs(pendingJobs);

            dto.setPelletingEfficiency(91.5); // dummy
            dto.setAvgWastageKg(3.8); // dummy
        }

        // --- For Inventory Managers ---
        if (role == Role.ADMIN || role == Role.INVENTORY_MANAGER) {
            List<RawMaterial> lowStock = rawMaterialRepo.findLowStock(50.0);
            List<Map<String, Object>> lowStockMapped = lowStock.stream().map(rm -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", rm.getName());
                map.put("inStockKg", rm.getInStockKg());
                map.put("threshold", 50.0);
                return map;
            }).collect(Collectors.toList());
            dto.setLowStockRMs(lowStockMapped);

            LocalDate cutoff = LocalDate.now().plusDays(7);
            List<RawMaterial> expiringSoon = rawMaterialRepo.findExpiringWithinDays(cutoff);
            List<Map<String, Object>> expiringMapped = expiringSoon.stream().map(rm -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", rm.getName());
                map.put("expiryDate", rm.getExpiryDate());
                return map;
            }).collect(Collectors.toList());
            dto.setExpiringRMs(expiringMapped);
        }

        // --- For Finance ---
        if (role == Role.ADMIN || role == Role.FINANCE_OFFICER) {
            List<Double> revenueTrend = new ArrayList<>();
            for (int i = 0; i < 30; i++) revenueTrend.add(Math.random() * 5000);
            dto.setRevenueTrendLast30Days(revenueTrend);

            dto.setTopPayingClients(List.of("AquaTech Ltd.", "GreenFeeds", "FarmPro"));
            dto.setReceivablesAmount(126500.00);
        }

        dto.setSmartAlerts(alerts);
        dto.setRecentActivityLog(activityLog); // future: inject log repo

        return dto;
    }
}
