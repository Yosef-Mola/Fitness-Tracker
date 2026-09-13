package com.fitnesstracker.api.service;

import com.fitnesstracker.api.model.*;
import com.fitnesstracker.api.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WorkoutService {

    private final WorkoutLogRepository workoutLogRepository;
    private final UserRepository userRepository;
    private final ExerciseTargetRepository exerciseTargetRepository;
    private final WorkoutRoutineRepository workoutRoutineRepository;
    private final RoutineExerciseRepository routineExerciseRepository;

    public WorkoutService(WorkoutLogRepository workoutLogRepository, UserRepository userRepository,
                          ExerciseTargetRepository exerciseTargetRepository, WorkoutRoutineRepository workoutRoutineRepository,
                          RoutineExerciseRepository routineExerciseRepository) {
        this.workoutLogRepository = workoutLogRepository;
        this.userRepository = userRepository;
        this.exerciseTargetRepository = exerciseTargetRepository;
        this.workoutRoutineRepository = workoutRoutineRepository;
        this.routineExerciseRepository = routineExerciseRepository;
    }

    public String recordExercise(Long userId, Long targetId, double weight, int sets, int reps) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<ExerciseTarget> targetOpt = exerciseTargetRepository.findById(targetId);
        if (userOpt.isEmpty() || targetOpt.isEmpty()) return "ERROR: User or Exercise not found.";

        User user = userOpt.get();
        ExerciseTarget target = targetOpt.get();

        List<WorkoutLog> userLogs = workoutLogRepository.findByUser_Id(userId);
        double maxPrevWeight = userLogs.stream()
                .filter(log -> log.getExercise() != null && log.getExercise().getId().equals(targetId))
                .mapToDouble(WorkoutLog::getWorkingWeight).max().orElse(0.0);

        double threshold = user.getCustomThresholdPercentage() > 0 ? user.getCustomThresholdPercentage() : 1.25;

        if (maxPrevWeight > 0 && weight > maxPrevWeight * threshold) {
            return String.format("WARNING: Weight jump exceeds your custom rule (%.0f%%)! Previous max weight was %.1f kg. Action blocked.", (threshold - 1) * 100, maxPrevWeight);
        }

        WorkoutLog log = new WorkoutLog();
        log.setUser(user);
        log.setExercise(target);
        log.setWorkingWeight(weight);
        log.setSets(sets);
        log.setReps(reps);
        log.setDate(LocalDate.now());
        workoutLogRepository.save(log);

        return String.format("Exercise recorded successfully for %s! Updated weight: %.1f kg.", user.getUsername(), weight);
    }

    public List<WorkoutLog> getHistory(Long userId) { return workoutLogRepository.findByUser_Id(userId); }

    public WorkoutRoutine createRoutine(Long userId, String name) {
        User user = userRepository.findById(userId).orElseThrow();
        WorkoutRoutine routine = new WorkoutRoutine();
        routine.setUser(user);
        routine.setName(name);
        return workoutRoutineRepository.save(routine);
    }

   public RoutineExercise addOrUpdateRoutineExercise(Long routineId, Long targetId, double weight, int sets, int reps) {
        WorkoutRoutine routine = workoutRoutineRepository.findById(routineId).orElseThrow();
        ExerciseTarget target = exerciseTargetRepository.findById(targetId).orElseThrow();

        Optional<RoutineExercise> existingOpt = routineExerciseRepository.findByRoutine_Id(routineId).stream()
                .filter(re -> re.getExercise().getId().equals(targetId)).findFirst();

        RoutineExercise re;
        if (existingOpt.isPresent()) {
            re = existingOpt.get();
            if (re.getDefaultWeight() != weight || re.getDefaultSets() != sets || re.getDefaultReps() != reps) {
                re.setDefaultWeight(weight);
                re.setDefaultSets(sets);
                re.setDefaultReps(reps);
                re.setLastModifiedDate(LocalDate.now()); // שומר תאריך רק כשיש עדכון!
            }
        } else {
            re = new RoutineExercise();
            re.setRoutine(routine);
            re.setExercise(target);
            re.setDefaultWeight(weight);
            re.setDefaultSets(sets);
            re.setDefaultReps(reps);
            re.setLastModifiedDate(null); // בלי תאריך ביצירה ראשונית (ללא כוכב)
        }
        return routineExerciseRepository.save(re);
    }

    public List<WorkoutRoutine> getUserRoutines(Long userId) { return workoutRoutineRepository.findByUser_Id(userId); }

    public List<RoutineExercise> getRoutineExercises(Long routineId) { return routineExerciseRepository.findByRoutine_Id(routineId); }

    public String logEntireRoutine(Long userId, Long routineId, String dateStr) {
        User user = userRepository.findById(userId).orElseThrow();
        List<RoutineExercise> exercises = routineExerciseRepository.findByRoutine_Id(routineId);
        if(exercises.isEmpty()) return "WARNING: Routine is empty!";

        LocalDate logDate = (dateStr != null && !dateStr.isEmpty()) ? LocalDate.parse(dateStr) : LocalDate.now();
        int count = 0;
        for (RoutineExercise re : exercises) {
            WorkoutLog log = new WorkoutLog();
            log.setUser(user);
            log.setExercise(re.getExercise());
            log.setWorkingWeight(re.getDefaultWeight());
            log.setSets(re.getDefaultSets());
            log.setReps(re.getDefaultReps());
            log.setDate(logDate);
            workoutLogRepository.save(log);
            count++;
        }
        return "Successfully logged " + count + " exercises on " + logDate + "!";
    }

    // --- פונקציות המחיקה החדשות! ---

    public String removeExerciseFromRoutine(Long routineExerciseId) {
        routineExerciseRepository.deleteById(routineExerciseId);
        return "Exercise removed from routine.";
    }

    public String deleteRoutine(Long routineId) {
        // מחיקת כל התרגילים המקושרים לתבנית זו קודם כל (כדי למנוע שגיאות מסד נתונים)
        List<RoutineExercise> exercises = routineExerciseRepository.findByRoutine_Id(routineId);
        routineExerciseRepository.deleteAll(exercises);
        
        // מחיקת התבנית עצמה
        workoutRoutineRepository.deleteById(routineId);
        return "Routine deleted successfully.";
    }
    public String deleteWorkoutLog(Long logId) {
        if (!workoutLogRepository.existsById(logId)) {
            return "ERROR: Log not found.";
        }
        workoutLogRepository.deleteById(logId);
        return "Workout log deleted successfully.";
    }
}