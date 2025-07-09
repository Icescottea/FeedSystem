package com.feed.feedv4.controller;

import com.feed.feedv4.dto.DashboardSummaryDTO;
import com.feed.feedv4.model.Role;
import com.feed.feedv4.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/{role}")
    public DashboardSummaryDTO getDashboard(@PathVariable String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            return dashboardService.getDashboardByRole(userRole);
        } catch (Exception e) {
            e.printStackTrace(); // ✅ this logs the stack trace
            throw new RuntimeException("Dashboard error: " + e.getMessage());
        }
    }
}
