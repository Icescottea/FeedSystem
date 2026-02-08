package com.feed.feedv4.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.Vendor;
import com.feed.feedv4.model.Vendor.VendorStatus;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    
    Optional<Vendor> findByVendorDisplayName(String vendorDisplayName);
    
    List<Vendor> findByStatus(VendorStatus status);
    
    @Query("SELECT v FROM Vendor v WHERE " +
           "LOWER(v.vendorDisplayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.vendorEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.vendorPhone) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Vendor> searchVendors(@Param("search") String search);
    
    @Query("SELECT v FROM Vendor v WHERE v.status = 'ACTIVE'")
    List<Vendor> findAllActive();
    
    @Query("SELECT COUNT(v) FROM Vendor v WHERE v.status = :status")
    Long countByStatus(@Param("status") VendorStatus status);
    
    boolean existsByVendorEmail(String vendorEmail);
    
    boolean existsByGstNumber(String gstNumber);
    
    @Query("SELECT v FROM Vendor v WHERE v.department = :department")
    List<Vendor> findByDepartment(@Param("department") String department);
    
    @Query("SELECT v FROM Vendor v WHERE v.location = :location")
    List<Vendor> findByLocation(@Param("location") String location);
}