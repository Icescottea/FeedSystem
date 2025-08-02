package com.feed.feedv4.controller;

import com.feed.feedv4.model.User;
import com.feed.feedv4.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // allow frontend
public class AuthController {

    private final UserRepository userRepo;

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepo.findByEmail(loginRequest.email());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(loginRequest.password())) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("fullName", user.getFullName());
                response.put("email", user.getEmail());
                response.put("roles", user.getRoles());
                response.put("active", user.isActive());
                return response;
            }
        }
        throw new RuntimeException("Invalid credentials");
    }

    record LoginRequest(String email, String password) {}
}
