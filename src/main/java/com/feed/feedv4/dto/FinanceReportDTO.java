package com.feed.feedv4.dto;

import java.util.List;
import java.util.Map;

public class FinanceReportDTO {
    
    public Map<String, Double> revenueByService;
    public List<String> topPayingClients;
    public double avgCostPerKg;
    public double avgChargePerKg;
    public double totalReceivables;
    public List<MonthlyProfitSnapshot> monthlyProfitability;
    
    public static class MonthlyProfitSnapshot {
        public String month;
        public double revenue;
        public double cost;
        public double profit;
    }
}

