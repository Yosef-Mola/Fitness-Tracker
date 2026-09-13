package com.fitnesstracker.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "exercise_logs")
public class ExerciseLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "target_id")
    public ExerciseTarget exercise;

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user; // Linked to the user who logged it

    public double workingWeight;
    public int reps;

    public ExerciseLog() {}

    // הקונסטרוקטור המעודכן שמקבל 4 ארגומנטים (כולל המשתמש)
    public ExerciseLog(ExerciseTarget exercise, User user, double workingWeight, int reps) {
        this.exercise = exercise;
        this.user = user;
        this.workingWeight = workingWeight;
        this.reps = reps;
    }
}