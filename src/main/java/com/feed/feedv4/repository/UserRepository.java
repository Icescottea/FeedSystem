package com.feed.feedv4.repository;

import com.feed.feedv4.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.feed.feedv4.model.Role;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE :role MEMBER OF u.roles")
    List<User> findByRolesContains(@Param("role") Role roles);

}
