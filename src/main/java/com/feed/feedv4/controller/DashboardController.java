package com.feed.feedv4.controller;

import com.feed.feedv4.dto.DashboardSummaryDTO;
import com.feed.feedv4.model.Role;
import com.feed.feedv4.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/{roles}")
    public DashboardSummaryDTO getDashboard(@PathVariable String roles) {
        try {
            Set<Role> roleSet = Arrays.stream(roles.split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .map(Role::valueOf)
                    .collect(Collectors.toSet());

            return dashboardService.getDashboardByRoles(roleSet);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Dashboard error: " + e.getMessage());
        }
    }
}
