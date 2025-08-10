package com.feed.feedv4.repository;

import com.feed.feedv4.model.ChargesConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChargesConfigRepository extends JpaRepository<ChargesConfig, Long> {

    // Find the latest active config
    Optional<ChargesConfig> findTopByActiveTrueOrderByLastUpdatedDesc();

}
