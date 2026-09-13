package com.fitnesstracker.api.controller;

import com.fitnesstracker.api.model.*;
import com.fitnesstracker.api.repository.ExerciseTargetRepository;
import com.fitnesstracker.api.service.WorkoutService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutController {

    private final WorkoutService workoutService;
    private final ExerciseTargetRepository targetRepository;

    public WorkoutController(WorkoutService workoutService, ExerciseTargetRepository targetRepository) {
        this.workoutService = workoutService;
        this.targetRepository = targetRepository;
    }

    @PostMapping("/log")
    public String logWorkout(@RequestParam Long userId, @RequestParam Long targetId,
                             @RequestParam double weight, @RequestParam int sets, @RequestParam int reps) {
        return workoutService.recordExercise(userId, targetId, weight, sets, reps);
    }

    @GetMapping("/targets")
    public List<ExerciseTarget> getAllTargets() { return targetRepository.findAll(); }

    @PostMapping("/targets")
    public ExerciseTarget createTarget(@RequestParam String name) {
        ExerciseTarget target = new ExerciseTarget(name, 0, 0);
        return targetRepository.save(target);
    }

    @GetMapping("/history")
    public List<WorkoutLog> getHistory(@RequestParam Long userId) { return workoutService.getHistory(userId); }

    @PostMapping("/routines")
    public WorkoutRoutine createRoutine(@RequestParam Long userId, @RequestParam String name) {
        return workoutService.createRoutine(userId, name);
    }

    @GetMapping("/routines")
    public List<WorkoutRoutine> getUserRoutines(@RequestParam Long userId) {
        return workoutService.getUserRoutines(userId);
    }

    @PostMapping("/routines/exercise")
    public RoutineExercise addOrUpdateExercise(@RequestParam Long routineId, @RequestParam Long targetId,
                                               @RequestParam double weight, @RequestParam int sets, @RequestParam int reps) {
        return workoutService.addOrUpdateRoutineExercise(routineId, targetId, weight, sets, reps);
    }

    @GetMapping("/routines/exercises")
    public List<RoutineExercise> getRoutineExercises(@RequestParam Long routineId) {
        return workoutService.getRoutineExercises(routineId);
    }

    @PostMapping("/routines/log")
    public String logRoutine(@RequestParam Long userId, @RequestParam Long routineId, @RequestParam(required = false) String date) {
        return workoutService.logEntireRoutine(userId, routineId, date);
    }

    // --- כתובות (Endpoints) של מחיקה ---

    @DeleteMapping("/routines/{routineId}")
    public String deleteRoutine(@PathVariable Long routineId) {
        return workoutService.deleteRoutine(routineId);
    }

    @DeleteMapping("/routines/exercises/{exerciseId}")
    public String removeExercise(@PathVariable Long exerciseId) {
        return workoutService.removeExerciseFromRoutine(exerciseId);
    }
    
    @DeleteMapping("/history/{logId}")
    public String deleteWorkoutLog(@PathVariable Long logId) {
        return workoutService.deleteWorkoutLog(logId);
    }
}