package com.feed.feedv4.controller;

import com.feed.feedv4.model.Role;
import com.feed.feedv4.model.User;
import com.feed.feedv4.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/create")
    public User create(@RequestBody User user) {
        user.setActive(true); // by default, user is active
        return repo.save(user);
    }

    @GetMapping
    public List<User> getAll() {
        return repo.findAll();
    }

    @GetMapping("/operators")
    public List<User> getOperators() {
        return repo.findByRole(Role.OPERATOR);
    }

}
