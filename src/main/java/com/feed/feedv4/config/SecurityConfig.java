package com.feed.feedv4.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().disable()
            .csrf().disable()
            .headers().frameOptions().disable().and()
            .authorizeHttpRequests().anyRequest().permitAll();
        return http.build();
    }
}
