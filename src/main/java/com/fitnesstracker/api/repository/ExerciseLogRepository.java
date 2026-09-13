package com.fitnesstracker.api.repository;

import com.fitnesstracker.api.model.ExerciseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseLogRepository extends JpaRepository<ExerciseLog, Long> {

    // שליפת היסטוריית אימונים לפי משתמש ותרגיל
    List<ExerciseLog> findByUserIdAndExerciseId(Long userId, Long exerciseId);
}