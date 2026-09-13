package com.fitnesstracker.api.service;

import com.fitnesstracker.api.model.User;
import com.fitnesstracker.api.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String username, String rawPassword) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists!");
        }
        User user = new User(username, rawPassword);
        return userRepository.save(user);
    }

    public User login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getPassword().equals(rawPassword)) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }

    public User updateThreshold(Long userId, double threshold) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCustomThresholdPercentage(threshold);
        return userRepository.save(user);
    }
}