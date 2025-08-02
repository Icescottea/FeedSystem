package com.feed.feedv4.repository;

import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByStatus(String status); 
    List<Invoice> findByCustomerId(Long customerId);
    @Query("SELECT DISTINCT i.customerName FROM Invoice i WHERE i.status = :status")
    List<String> findDistinctCustomerNamesByStatus(@Param("status") String status);

}
