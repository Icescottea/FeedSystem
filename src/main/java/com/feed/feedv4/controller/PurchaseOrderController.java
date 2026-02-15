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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.feed.feedv4.dto.PurchaseOrderDTO;
import com.feed.feedv4.model.PurchaseOrder;
import com.feed.feedv4.service.PurchaseOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/purchase-orders")

public class PurchaseOrderController {
    
    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }
    
    @GetMapping
    public ResponseEntity<List<PurchaseOrderDTO>> getAllPurchaseOrders() {
        List<PurchaseOrderDTO> purchaseOrders = purchaseOrderService.getAllPurchaseOrders();
        return ResponseEntity.ok(purchaseOrders);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> getPurchaseOrderById(@PathVariable Long id) {
        PurchaseOrderDTO purchaseOrder = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(purchaseOrder);
    }
    
    @PostMapping
    public ResponseEntity<PurchaseOrderDTO> createPurchaseOrder(@Valid @RequestBody PurchaseOrderDTO dto) {
        PurchaseOrderDTO created = purchaseOrderService.createPurchaseOrder(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> updatePurchaseOrder(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderDTO dto) {
        PurchaseOrderDTO updated = purchaseOrderService.updatePurchaseOrder(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/clone")
    public ResponseEntity<PurchaseOrderDTO> clonePurchaseOrder(@PathVariable Long id) {
        PurchaseOrderDTO cloned = purchaseOrderService.clonePurchaseOrder(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(cloned);
    }
    
    @PutMapping("/{id}/billed-status")
    public ResponseEntity<PurchaseOrderDTO> updateBilledStatus(
            @PathVariable Long id,
            @RequestParam PurchaseOrder.BilledStatus billedStatus) {
        PurchaseOrderDTO updated = purchaseOrderService.updateBilledStatus(id, billedStatus);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<PurchaseOrderDTO>> getPurchaseOrdersByVendor(@PathVariable Long vendorId) {
        List<PurchaseOrderDTO> purchaseOrders = purchaseOrderService.getPurchaseOrdersByVendor(vendorId);
        return ResponseEntity.ok(purchaseOrders);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<PurchaseOrderDTO>> searchPurchaseOrders(@RequestParam String query) {
        List<PurchaseOrderDTO> purchaseOrders = purchaseOrderService.searchPurchaseOrders(query);
        return ResponseEntity.ok(purchaseOrders);
    }
}