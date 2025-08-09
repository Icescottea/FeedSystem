package com.feed.feedv4.repository;

import com.feed.feedv4.model.ChargesConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChargesConfigRepository extends JpaRepository<ChargesConfig, Long> {
    List<ChargesConfig> findByCustomerId(Long customerId);

    Optional<ChargesConfig> findTopByCustomerIdAndServiceTypeOrderByLastUpdatedDesc(Long customerId, String serviceType);

    Optional<ChargesConfig> findTopByServiceTypeOrderByLastUpdatedDesc(String serviceType);
}
