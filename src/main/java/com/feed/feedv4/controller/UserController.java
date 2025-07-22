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
        System.out.println("Creating user: " + user.getEmail());
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Password cannot be blank");
        }
        user.setActive(true);
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

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updated) {
        User existing = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        existing.setFullName(updated.getFullName());
        existing.setRole(updated.getRole());
        existing.setActive(updated.isActive());
        return repo.save(existing);
    }

    @PutMapping("/{id}/deactivate")
    public User deactivate(@PathVariable Long id) {
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        return repo.save(user);
    }

    @PutMapping("/{id}/reactivate")
    public User reactivate(@PathVariable Long id) {
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        return repo.save(user);
    }

    @PutMapping("/{id}/toggle-active")
    public User toggleActive(@PathVariable Long id) {
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        return repo.save(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        repo.deleteById(id);
    }

}
