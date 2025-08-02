package com.feed.feedv4.repository;

import com.feed.feedv4.model.FeedProfile;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedProfileRepository extends JpaRepository<FeedProfile, Long> {

    @Query("SELECT fp.mandatoryIngredients FROM FeedProfile fp WHERE fp.id = :profileId")
    List<String> findMandatoryIngredients(@Param("profileId") Long profileId);
    
    @Query("SELECT fp.restrictedIngredients FROM FeedProfile fp WHERE fp.id = :profileId")
    List<String> findRestrictedIngredients(@Param("profileId") Long profileId);
    
    List<FeedProfile> findByArchivedFalse();
}
