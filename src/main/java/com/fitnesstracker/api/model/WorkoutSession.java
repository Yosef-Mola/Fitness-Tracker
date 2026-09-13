package com.fitnesstracker.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Entity
public class WorkoutSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public LocalDate date;
    public String planName;

    @OneToMany(cascade = CascadeType.ALL)
    public List<ExerciseLog> performedExercises = new ArrayList<>();

    public boolean isSuccessful;
    public int difficultyRating;

    public WorkoutSession() {
    }

    public WorkoutSession(String planName, boolean isSuccessful, int difficultyRating) {
        this.date = LocalDate.now();
        this.planName = planName;
        this.isSuccessful = isSuccessful;
        this.difficultyRating = difficultyRating;
    }

    public void addExerciseLog(ExerciseLog log) {
        this.performedExercises.add(log);
    }
}