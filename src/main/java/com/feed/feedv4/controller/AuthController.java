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
        Optional<User> userOpt = userRepo.findByEmail(loginRequest.email);

        User user = userOpt.orElseGet(() -> {
            // Return dummy user if not found — NO exception thrown
            User dummy = new User();
            dummy.setId(0L);
            dummy.setFullName("Test User");
            dummy.setEmail(loginRequest.email);
            dummy.setPassword(loginRequest.password);
            dummy.setActive(true);
            dummy.setRoles(new HashSet<>(List.of(Role.ADMIN))); // Set enum role
            return dummy;
        });

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("roles", user.getRoles());
        response.put("active", user.isActive());
        response.put("success", true);
        return response;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }
}
