package com.feed.feedv4.service;

import com.feed.feedv4.model.FeedProfile;
import com.feed.feedv4.repository.FeedProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedProfileService {

    private final FeedProfileRepository repository;

    public FeedProfileService(FeedProfileRepository repository) {
        this.repository = repository;
    }

    public List<FeedProfile> getAll() {
        return repository.findAll();
    }

    public Optional<FeedProfile> getById(Long id) {
        return repository.findById(id);
    }

    public FeedProfile save(FeedProfile profile) {
        return repository.save(profile);
    }

    public FeedProfile update(Long id, FeedProfile updated) {
        return repository.findById(id).map(existing -> {
            existing.setFeedName(updated.getFeedName());
            existing.setSpecies(updated.getSpecies());
            existing.setStage(updated.getStage());
            existing.setProtein(updated.getProtein());
            existing.setEnergy(updated.getEnergy());
            existing.setCalcium(updated.getCalcium());
            existing.setPhosphorus(updated.getPhosphorus());
            existing.setFiber(updated.getFiber());
            existing.setFat(updated.getFat());
            existing.setMethionine(updated.getMethionine());
            existing.setLysine(updated.getLysine());
            existing.setMaxSalt(updated.getMaxSalt());
            existing.setMaxFiber(updated.getMaxFiber());
            existing.setMandatoryIngredients(updated.getMandatoryIngredients());
            existing.setRestrictedIngredients(updated.getRestrictedIngredients());
            existing.setPreferenceStrategy(updated.getPreferenceStrategy());
            existing.setTags(updated.getTags());
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public void archive(Long id) {
        FeedProfile profile = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("FeedProfile not found"));
        
        profile.setArchived(!profile.isArchived()); // 🔁 Toggle
        repository.save(profile);
    }

    public void toggleLock(Long id) {
        repository.findById(id).ifPresent(profile -> {
            profile.setLocked(!profile.isLocked());
            repository.save(profile);
        });
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
