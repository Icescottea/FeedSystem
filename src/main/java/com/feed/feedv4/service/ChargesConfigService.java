package com.feed.feedv4.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feed.feedv4.model.ChargesConfig;
import com.feed.feedv4.repository.ChargesConfigRepository;

@Service
public class ChargesConfigService {

    @Autowired
    private ChargesConfigRepository repo;

    public ChargesConfig createOrUpdate(ChargesConfig config) {
        return repo.save(config);
    }

    public ChargesConfig getByCustomerId(Long customerId) {
        List<ChargesConfig> configs = repo.findByCustomerId(customerId);
        return configs.isEmpty() ? null : configs.get(0);
    }

    public List<ChargesConfig> getAll() {
        return repo.findAll();
    }

    public ChargesConfig getConfigById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Config not found"));
    }

    public ChargesConfig saveOrUpdate(ChargesConfig config) {
        return repo.save(config);
    }

    public void deleteConfig(Long id) {
        repo.deleteById(id);
    }
}
