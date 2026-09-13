package com.fitnesstracker.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Will be stored as BCrypt hash

    // Custom rule configuration for injury prevention (default 25% -> 1.25)
    private double customThresholdPercentage = 1.25;

    public User() {}

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public double getCustomThresholdPercentage() { return customThresholdPercentage; }
    public void setCustomThresholdPercentage(double customThresholdPercentage) { this.customThresholdPercentage = customThresholdPercentage; }
}