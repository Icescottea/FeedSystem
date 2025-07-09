package com.feed.feedv4.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDTO {

    // General Widgets
    private List<String> recentActivityLog;
    private List<String> smartAlerts;

    // Formulator / Admin
    private int todaysFormulations;
    private double avgCostPerKgLast30Days;
    private String topUsedRawMaterial;

    // Pelleting
    private int pendingPelletingJobs;
    private double pelletingEfficiency;
    private double avgWastageKg;

    // Finance
    private List<Double> revenueTrendLast30Days; // 30 daily values
    private List<String> topPayingClients;
    private double receivablesAmount;

    // Inventory
    private List<Map<String, Object>> lowStockRMs;
    private List<Map<String, Object>> expiringRMs;

    // Date for Snapshot
    private LocalDate snapshotDate;

    // Getters and Setters
    public List<String> getRecentActivityLog() {
        return recentActivityLog;
    }

    public void setRecentActivityLog(List<String> recentActivityLog) {
        this.recentActivityLog = recentActivityLog;
    }

    public List<String> getSmartAlerts() {
        return smartAlerts;
    }

    public void setSmartAlerts(List<String> smartAlerts) {
        this.smartAlerts = smartAlerts;
    }

    public int getTodaysFormulations() {
        return todaysFormulations;
    }

    public void setTodaysFormulations(int todaysFormulations) {
        this.todaysFormulations = todaysFormulations;
    }

    public double getAvgCostPerKgLast30Days() {
        return avgCostPerKgLast30Days;
    }

    public void setAvgCostPerKgLast30Days(double avgCostPerKgLast30Days) {
        this.avgCostPerKgLast30Days = avgCostPerKgLast30Days;
    }

    public String getTopUsedRawMaterial() {
        return topUsedRawMaterial;
    }

    public void setTopUsedRawMaterial(String topUsedRawMaterial) {
        this.topUsedRawMaterial = topUsedRawMaterial;
    }

    public int getPendingPelletingJobs() {
        return pendingPelletingJobs;
    }

    public void setPendingPelletingJobs(int pendingPelletingJobs) {
        this.pendingPelletingJobs = pendingPelletingJobs;
    }

    public double getPelletingEfficiency() {
        return pelletingEfficiency;
    }

    public void setPelletingEfficiency(double pelletingEfficiency) {
        this.pelletingEfficiency = pelletingEfficiency;
    }

    public double getAvgWastageKg() {
        return avgWastageKg;
    }

    public void setAvgWastageKg(double avgWastageKg) {
        this.avgWastageKg = avgWastageKg;
    }

    public List<Double> getRevenueTrendLast30Days() {
        return revenueTrendLast30Days;
    }

    public void setRevenueTrendLast30Days(List<Double> revenueTrendLast30Days) {
        this.revenueTrendLast30Days = revenueTrendLast30Days;
    }

    public List<String> getTopPayingClients() {
        return topPayingClients;
    }

    public void setTopPayingClients(List<String> topPayingClients) {
        this.topPayingClients = topPayingClients;
    }

    public double getReceivablesAmount() {
        return receivablesAmount;
    }

    public void setReceivablesAmount(double receivablesAmount) {
        this.receivablesAmount = receivablesAmount;
    }

    public List<Map<String, Object>> getLowStockRMs() {
        return lowStockRMs;
    }

    public void setLowStockRMs(List<Map<String, Object>> lowStockRMs) {
        this.lowStockRMs = lowStockRMs;
    }

    public List<Map<String, Object>> getExpiringRMs() {
        return expiringRMs;
    }

    public void setExpiringRMs(List<Map<String, Object>> expiringRMs) {
        this.expiringRMs = expiringRMs;
    }

    public LocalDate getSnapshotDate() {
        return snapshotDate;
    }

    public void setSnapshotDate(LocalDate snapshotDate) {
        this.snapshotDate = snapshotDate;
    }
}
