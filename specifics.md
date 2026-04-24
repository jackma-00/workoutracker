**Application Specification — Personal Workout & Diet Note Tracker**

---

### 1. Scope and Context

A locally hosted web application intended for single-user, personal use. The system functions as a structured note-taking tool focused exclusively on workout programs and diet plans. It prioritizes simplicity, responsiveness, and clean visual organization while remaining extensible for future analytical and AI-driven features.

---

### 2. Architecture Overview

**Frontend**

* Framework: React (latest stable ecosystem)
* Design system: Modern UI inspired by Apple / Microsoft Fluent

  * Glassmorphism (blurred backgrounds, translucent cards)
  * Soft shadows, rounded corners, minimal color palette
* Pattern: Model–View–Presenter (MVP)

  * **Model**: local state + API data
  * **View**: presentational React components
  * **Presenter**: state orchestration, business logic, API interaction

**Backend**

* Language: Python
* Framework: FastAPI
* Database: SQLite
* Design principles:

  * Modular architecture (routers, services, repositories)
  * Clear separation of concerns
  * Stateless API layer
  * Designed for future migration (e.g., PostgreSQL)

---

### 3. Core Features

#### 3.1 Note Categorization

The application supports exactly three tabs:

1. **Workout**

   * Contains all workout-related notes (training plans, routines)

2. **Diet**

   * Contains all diet-related notes (meal plans, nutrition strategies)

3. **Current (Pinned)**

   * Contains user-pinned notes from either Workout or Diet
   * Serves as a quick-access dashboard

Each note belongs to **one and only one primary category** (Workout or Diet), but may optionally appear in the **Current tab** if pinned.

---

#### 3.2 Notes System

Each note is represented as a card with the following capabilities:

* **Editable title (heading)**
* **Rich text content**

  * Basic formatting (bold, italic, lists)
  * Emoji support
* **Custom background color**
* **Creation timestamp**
* **Last modified timestamp**
* **Pin toggle (for Current tab)**

---

#### 3.3 Sorting Behavior

* Default sorting: **creation date (descending)**
* Dynamic sorting: switches to **last modified date (descending)** after edits
* Pinned notes:

  * Always visible in the **Current tab**
  * Do not affect ordering in Workout/Diet tabs

---

#### 3.4 UI/UX Behavior

* Card-based layout (grid or masonry)
* Smooth transitions and micro-interactions
* Inline editing or modal editing (implementation choice)
* Minimal navigation:

  * Tab switcher (Workout | Diet | Current)
* Persistent local experience (no authentication required)

---

### 4. Data Model (Conceptual)

**Note Entity**

* `id` (UUID or integer)
* `title` (string)
* `content` (text / JSON for rich text)
* `category` (enum: WORKOUT | DIET)
* `is_pinned` (boolean)
* `background_color` (string / hex)
* `created_at` (timestamp)
* `updated_at` (timestamp)

---

### 5. API Design (FastAPI)

**Endpoints (initial set)**

* `GET /notes` → list all notes
* `POST /notes` → create note
* `GET /notes/{id}` → retrieve note
* `PUT /notes/{id}` → update note
* `DELETE /notes/{id}` → delete note
* `PATCH /notes/{id}/pin` → toggle pin

Optional query params:

* `?category=workout|diet`
* `?pinned=true`

---

### 6. Engineering Principles

* **Resilience**

  * Graceful error handling (frontend + backend)
  * Input validation via FastAPI/Pydantic
* **Scalability**

  * Layered backend (router → service → repository)
  * Decoupled frontend logic (MVP presenters)
* **Extensibility**

  * Data model designed to support:

    * Metrics (calories, volume)
    * Tagging system
    * AI-generated suggestions
* **Maintainability**

  * Clear folder structure
  * Typed interfaces (TypeScript recommended for frontend)

---

### 7. Future Extensions (Planned)

* Weekly tracking:

  * Calorie intake
  * Training volume
* Analytics dashboard
* AI-assisted features:

  * Workout generation
  * Diet recommendations
  * Progress insights
* Cross-note linking or tagging
* Export/import functionality

---

### 8. Non-Goals (Initial Version)

* Multi-user support
* Authentication/authorization
* Cloud sync
* Mobile-native application

---

This specification defines a minimal but structured foundation: a focused, visually refined note system with a clear domain (fitness and diet), engineered to support incremental evolution into a more advanced tracking and analysis platform.
