package com.feed.feedv4.repository;

import com.feed.feedv4.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import com.feed.feedv4.model.Role;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);
}
