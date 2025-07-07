package com.feed.feedv4.repository;

import com.feed.feedv4.model.ChargesConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChargesConfigRepository extends JpaRepository<ChargesConfig, Long> {
    ChargesConfig findTopByOrderByLastUpdatedDesc();
    List<ChargesConfig> findByCustomerId(Long customerId);
}
