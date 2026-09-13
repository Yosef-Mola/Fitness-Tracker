# Full-Stack Fitness Tracker 💪

A minimalist, highly structured full-stack web application designed for personal workout management, consistent tracking, and automated injury prevention.

## 🎯 What is it?
Tracking workouts in a phone's Notes app is inefficient and lacks smart insights. This Fitness Tracker is a dedicated platform that allows users to create routines, log daily weights/reps, and track their consistency over a 14-day rolling window through visual gamification. 

More importantly, it includes a **Server-Side Safety Engine** to monitor progressive overload and prevent ego-lifting or extreme weight jumps.

## 🧠 Why I Built It (The Problem & Solution)
* **The Fitness Problem:** Many apps are either overly complex or too simple, lacking proactive safety warnings for heavy compound exercises (like Squats or Deadlifts) where rapid weight increases can cause injuries.
* **The Engineering Solution:** I built a custom **Safety Threshold Engine** that intercepts workout logs before they are saved. It calculates the weight jump percentage against the user's historical data. If the jump exceeds a defined safe threshold (e.g., 25%), the server actively blocks the entry.
* **Architectural Choice:** This logic was intentionally implemented on the **backend (Spring Boot)** rather than the frontend, strictly adhering to the "Never trust the client" system design principle, ensuring data integrity even if the client interface is bypassed.

## 🏗️ Architecture & Data Flow (The 5 Nodes)

1. **Client (React SPA):** Fast, distraction-free UI utilizing state management for seamless navigation without page reloads.
2. **API Gateway / CORS Layer:** Strictly configured in Spring Boot to accept requests only from authorized local origins, securing the communication pipeline.
3. **API Service (Spring Boot / Java 21):** The core REST API structured with clear Separation of Concerns (Controllers for routing, Services for business logic). Leverages Java's strong static typing and Spring's Dependency Injection for robust, enterprise-grade stability.
4. **Safety Rule Engine:** Custom Java algorithm analyzing previous workout logs and applying business rules before database insertion.
5. **Relational Database (H2 File-based):** Stores Users, Routines, Exercises, and Logs using Spring Data JPA (Hibernate). Ensures strict data integrity and cascading deletes through proper foreign key relationships, without the overhead of an external SQL server.

## 💻 Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Java 21, Spring Boot (Web, Data JPA)
* **Database:** H2 Database (File-based storage)
* **Architecture:** RESTful API, MVC Pattern, Client-Server Model

## 🚀 Getting Started (Run Locally)

### 1. Start the Backend (Spring Boot)
1. Open the project in your IDE (VS Code / IntelliJ).
2. Navigate to the backend directory (`api` / `src`).
3. Run the application via your IDE's run button, or use the terminal:
   ```bash
   mvn spring-boot:run