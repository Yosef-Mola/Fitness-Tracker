package com.fitnesstracker.api.repository;

import com.fitnesstracker.api.model.WorkoutRoutine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkoutRoutineRepository extends JpaRepository<WorkoutRoutine, Long> {
    List<WorkoutRoutine> findByUser_Id(Long userId);
}