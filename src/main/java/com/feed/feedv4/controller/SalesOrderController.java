package com.feed.feedv4.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.feed.feedv4.dto.SalesOrderDTO;
import com.feed.feedv4.service.SalesOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @GetMapping
    public ResponseEntity<List<SalesOrderDTO>> getAll() {
        return ResponseEntity.ok(salesOrderService.getAllSalesOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOrderDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.getSalesOrderById(id));
    }

    @PostMapping
    public ResponseEntity<SalesOrderDTO> create(@Valid @RequestBody SalesOrderDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(salesOrderService.createSalesOrder(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesOrderDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody SalesOrderDTO dto) {
        return ResponseEntity.ok(salesOrderService.updateSalesOrder(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        salesOrderService.deleteSalesOrder(id);
        return ResponseEntity.noContent().build();
    }
}