package com.feed.feedv4.controller;

import com.feed.feedv4.model.Role;
import com.feed.feedv4.model.User;
import com.feed.feedv4.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @PostMapping("/login")
public Map<String, Object> login(@RequestBody LoginRequest loginRequest) {
    Map<String, Object> response = new HashMap<>();
    Optional<User> userOpt = userRepo.findByEmail(loginRequest.email);

    if (userOpt.isPresent()) {
        User user = userOpt.get();
        if (user.getPassword().equals(loginRequest.password)) {
            response.put("id", user.getId());
            response.put("fullName", user.getFullName());
            response.put("email", user.getEmail());
            response.put("roles", user.getRoles());
            response.put("active", user.isActive());
            response.put("success", true);
            return response;
        }
    }

    response.put("success", false);
    response.put("message", "Invalid credentials");
    return response;
} 

    public static class LoginRequest {
        public String email;
        public String password;
    }
}
