package com.fitnesstracker.api.repository;

import com.fitnesstracker.api.model.RoutineExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoutineExerciseRepository extends JpaRepository<RoutineExercise, Long> {
    List<RoutineExercise> findByRoutine_Id(Long routineId);
}