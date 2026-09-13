package com.fitnesstracker.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class RoutineExercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private WorkoutRoutine routine;

    @ManyToOne
    private ExerciseTarget exercise;

    private double defaultWeight;
    private int defaultSets; 
    private int defaultReps;
    
    // הורדנו את ה- "= LocalDate.now()" כדי שזה יהיה ריק ביצירה!
    private LocalDate lastModifiedDate; 

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public WorkoutRoutine getRoutine() { return routine; }
    public void setRoutine(WorkoutRoutine routine) { this.routine = routine; }
    public ExerciseTarget getExercise() { return exercise; }
    public void setExercise(ExerciseTarget exercise) { this.exercise = exercise; }
    public double getDefaultWeight() { return defaultWeight; }
    public void setDefaultWeight(double defaultWeight) { this.defaultWeight = defaultWeight; }
    public int getDefaultSets() { return defaultSets; }
    public void setDefaultSets(int defaultSets) { this.defaultSets = defaultSets; }
    public int getDefaultReps() { return defaultReps; }
    public void setDefaultReps(int defaultReps) { this.defaultReps = defaultReps; }
    public LocalDate getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(LocalDate lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }
}