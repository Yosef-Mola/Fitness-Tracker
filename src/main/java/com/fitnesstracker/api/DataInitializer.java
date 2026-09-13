package com.fitnesstracker.api;

import com.fitnesstracker.api.model.ExerciseTarget;
import com.fitnesstracker.api.repository.ExerciseTargetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ExerciseTargetRepository targetRepo;

    public DataInitializer(ExerciseTargetRepository targetRepo) {
        this.targetRepo = targetRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (targetRepo.count() == 0) {
            // הוספת תרגילים אמיתיים למסד הנתונים כדי שיהיה לנו עם מה לעבוד
            targetRepo.save(new ExerciseTarget("Bulgarian Split Squat", 3, 10));
            targetRepo.save(new ExerciseTarget("Pull-ups", 3, 8));
            System.out.println("--- Exercise data successfully loaded into database ---");
        }
    }
}