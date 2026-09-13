package com.fitnesstracker.api.model;

import jakarta.persistence.*;

@Entity
public class ExerciseTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id; // המערכת תייצר ID ייחודי לכל שורה בטבלה

    public String name;
    public int targetSets;
    public int targetReps;

    public ExerciseTarget() {
    } // קונסטרקטור ריק הוא חובה במסדי נתונים

    public ExerciseTarget(String name, int targetSets, int targetReps) {
        this.name = name;
        this.targetSets = targetSets;
        this.targetReps = targetReps;
    }

    // הוספת המתודות שהשירות מחפש:
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}