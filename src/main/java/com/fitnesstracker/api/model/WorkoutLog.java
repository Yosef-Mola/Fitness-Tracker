package com.fitnesstracker.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "workout_logs")
public class WorkoutLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double workingWeight;
    private int sets; // <-- הוספנו סטים!
    private int reps;
    private LocalDate date = LocalDate.now();

    @ManyToOne
    private User user;

    @ManyToOne
    private ExerciseTarget exercise;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public double getWorkingWeight() { return workingWeight; }
    public void setWorkingWeight(double workingWeight) { this.workingWeight = workingWeight; }
    public int getSets() { return sets; }
    public void setSets(int sets) { this.sets = sets; }
    public int getReps() { return reps; }
    public void setReps(int reps) { this.reps = reps; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ExerciseTarget getExercise() { return exercise; }
    public void setExercise(ExerciseTarget exercise) { this.exercise = exercise; }
}