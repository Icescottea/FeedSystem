package com.feed.feedv4.repository;

import com.feed.feedv4.model.FeedProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedProfileRepository extends JpaRepository<FeedProfile, Long> {
}
