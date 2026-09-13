package com.fitnesstracker.api.repository;

import com.fitnesstracker.api.model.ExerciseTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExerciseTargetRepository extends JpaRepository<ExerciseTarget, Long> {
}