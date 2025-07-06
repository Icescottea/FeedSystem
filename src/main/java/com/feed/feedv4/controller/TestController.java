package com.feed.feedv4.controller;

import com.feed.feedv4.model.TestEntity;
import com.feed.feedv4.repository.TestEntityRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final TestEntityRepository repo;

    public TestController(TestEntityRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<TestEntity> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public TestEntity create(@RequestBody TestEntity t) {
        return repo.save(t);
    }
}
