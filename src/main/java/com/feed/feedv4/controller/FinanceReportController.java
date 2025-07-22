package com.feed.feedv4.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.feed.feedv4.dto.FinanceReportDTO;
import com.feed.feedv4.service.FinanceReportService;

@RestController
@RequestMapping("/api/finance")
public class FinanceReportController {

    @Autowired private FinanceReportService reportService;

    @GetMapping("/reports")
    public FinanceReportDTO getReport() {
        return reportService.generateReport();
    }
}

