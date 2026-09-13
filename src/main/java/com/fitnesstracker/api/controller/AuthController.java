package com.fitnesstracker.api.controller;

import com.fitnesstracker.api.model.User;
import com.fitnesstracker.api.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(@RequestParam String username, @RequestParam String password) {
        return authService.register(username, password);
    }

    @PostMapping("/login")
    public User login(@RequestParam String username, @RequestParam String password) {
        return authService.login(username, password);
    }

    @PostMapping("/rule")
    public User updateRule(@RequestParam Long userId, @RequestParam double threshold) {
        return authService.updateThreshold(userId, threshold);
    }
}