package com.feed.feedv4.repository;

import com.feed.feedv4.model.SalesOrder;
import com.feed.feedv4.model.SalesOrder.SalesOrderStatus;
import com.feed.feedv4.model.SalesOrder.InvoicedStatus;
import com.feed.feedv4.model.SalesOrder.PaymentStatus;
import com.feed.feedv4.model.SalesOrder.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    
    Optional<SalesOrder> findBySalesOrderNumber(String salesOrderNumber);
    
    List<SalesOrder> findByCustomerId(Long customerId);
    
    List<SalesOrder> findByStatus(SalesOrderStatus status);
    
    List<SalesOrder> findByOrderStatus(OrderStatus orderStatus);
    
    List<SalesOrder> findByInvoicedStatus(InvoicedStatus invoicedStatus);
    
    List<SalesOrder> findByPaymentStatus(PaymentStatus paymentStatus);
    
    @Query("SELECT so FROM SalesOrder so WHERE " +
           "LOWER(so.salesOrderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(so.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<SalesOrder> searchSalesOrders(@Param("search") String search);
    
    @Query("SELECT so FROM SalesOrder so WHERE " +
           "so.salesOrderDate BETWEEN :startDate AND :endDate")
    List<SalesOrder> findBySalesOrderDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(so) FROM SalesOrder so WHERE so.status = :status")
    Long countByStatus(@Param("status") SalesOrderStatus status);
    
    @Query("SELECT COUNT(so) FROM SalesOrder so WHERE so.orderStatus = :orderStatus")
    Long countByOrderStatus(@Param("orderStatus") OrderStatus orderStatus);
    
    @Query("SELECT COALESCE(SUM(so.total), 0) FROM SalesOrder so WHERE so.status NOT IN ('VOID')")
    BigDecimal sumTotalSalesOrders();
    
    @Query("SELECT COALESCE(SUM(so.total), 0) FROM SalesOrder so WHERE so.status = :status")
    BigDecimal sumTotalByStatus(@Param("status") SalesOrderStatus status);
    
    boolean existsBySalesOrderNumber(String salesOrderNumber);
}