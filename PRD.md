# Product Requirement Document (PRD): Boxing Pro Trainer - Smart Trainer Upgrade

## 1. Overview
Transform the current "Boxing Pro Trainer" MVP (a one-way timer) into a "Smart Trainer" data-driven Progressive Web App (PWA). The new app will feature bi-directional data sync with Google Sheets, a smart randomized training logic, audio controls, and a mobile-first native app experience.

## 2. Feature Requirements

### 2.1. Mobile-First & PWA Installability
**Goal:** The app must act as a Trusted Web Activity (TWA) / Native App on Android Chrome and iOS Safari.

*   **Manifest Configuration:**
    *   Create a strict `manifest.json`.
    *   `display`: `standalone` (Removes URL bar).
    *   `orientation`: `landscape` (Preferred, but see Orientation Logic below).
    *   Include necessary icons, `start_url`, `background_color`, `theme_color`.

*   **Orientation Logic (Simulated Landscape):**
    *   **Requirement:** On mobile phones (portrait), the UI must simulate the "Tablet Landscape" layout.
    *   **Strategy:** Implement a CSS "Force Landscape" mode.
        *   If the device is in portrait mode (aspect ratio < 1), apply a CSS transform (`rotate(90deg)`) to the main container or use a strict grid adaptation that mimics the side-by-side layout (Timer Left, Info Right) scaled down to fit the width.
        *   **User Mental Model:** The dashboard (Timer + Combo) is the primary focus.
    *   **Implementation Note:** Avoid standard responsive stacking (column layout) in the Timer View. The Timer and Combo display should remain side-by-side or structurally similar to the desktop/tablet view to maintain the "Cockpit" feel.

### 2.2. Data & Analytics (Bi-Directional Sync)
**Goal:** Enable reading user statistics from Google Sheets to provide progress insights, in addition to the existing writing capability.

*   **Bi-Directional Sync Logic:**
    *   **Write (Existing):** Send workout data to Sheets upon completion.
    *   **Read (New):** Fetch aggregated user stats on app load.

*   **Filtering Logic:**
    *   When calculating stats (server-side or client-side post-fetch), **only include workouts with duration > 10 minutes**. Short tests or accidental starts should be ignored.

*   **Dashboard Stats (Fetch on Load):**
    *   **Average Workouts per Week:** (e.g., "3.5 / week")
    *   **Average Duration per Session:** (e.g., "25 mins")
    *   **Average Difficulty Level:** (e.g., "Pro")

### 2.3. Training Logic (The "Smart Randomizer")
**Goal:** Replace the fixed pattern loop with a dynamic, intelligent combo generator.

*   **Phase A (Fixed Warmup/Intro):**
    *   **Timing:** First 3 minutes (approx. Round 1).
    *   **Pattern:** Strictly follow: `["1", "1-2", "1-2-3"]`.

*   **Phase B (Smart Random Loop):**
    *   **Timing:** From Round 2 onwards (or after 3 mins).
    *   **Logic:** Pull from the `patternsSource` combo pool.
    *   **Constraint ("Deck of Cards" Algorithm):**
        *   Create a "deck" of all available combos for the current difficulty/round context.
        *   Shuffle the deck.
        *   Deal (display) combos one by one.
        *   **No Repeats:** Do not repeat a combo until the entire deck has been shown once.
        *   Reshuffle when the deck is empty.

### 2.4. Audio Control
**Goal:** Give users control over sound feedback.

*   **Global Mute Toggle:**
    *   **UI:** Add a mute/unmute icon button (e.g., top corner or settings area).
    *   **Logic:** Mutes all app sounds (`bell.mp3`, `minute.mp3`, `countdown.mp3`) immediately. Persist state in `localStorage`.

---

## 3. Technical Specifications & Deliverables

### 3.1. Feature Hierarchy (Stats vs. Timer)
**Screen Organization:**

1.  **Top Bar (New - "The Hud"):**
    *   Contains **Global Mute Toggle** (Right) and **User Stats Summary** (Left/Center).
    *   *Stats Summary (Compact):* "Avg: 3/wk • 25m • Pro" (Clicking might expand detailed view).

2.  **Main Content Area (The Dashboard):**
    *   **Setup Mode (Initial State):**
        *   *Left:* Round Configuration (as is).
        *   *Right:* Difficulty Selection (as is).
    *   **Timer Mode (Active State):**
        *   *Left:* Main Timer & Session Timer.
        *   *Right:* Combo Display (Current & Next).

3.  **Bottom Bar:**
    *   **Primary Action:** "START FIGHT" (Setup) or Controls (Timer).

### 3.2. User Flow (Data Fetching)
1.  **App Launch:**
    *   Load `index.html` & resources.
    *   **State:** `Loading` (Show skeleton loader or spinner in the "Top Bar" stats area).
2.  **Data Fetch:**
    *   Trigger `GET` request to `GOOGLE_SCRIPT_URL`.
    *   *Param:* `?action=getStats` (if needed for routing in script).
3.  **Response Handling:**
    *   **Success:** Parse JSON. Update "Top Bar" with `avgWorkouts`, `avgDuration`, `avgLevel`.
    *   **Failure/Offline:** Hide stats area or show "Offline Mode". Store/Load last known stats from `localStorage` if available.
    *   **Timeout:** If > 5s, fallback to local/offline state.

### 3.3. Data Structure Suggestion
**Google Apps Script API Response (JSON):**

The Google Script `doGet()` function should return this structure:

```json
{
  "status": "success",
  "meta": {
    "syncTimestamp": "2023-10-27T10:00:00Z"
  },
  "stats": {
    "weeklyAverage": 3.2,
    "sessionAverageMinutes": 24,
    "difficultyMode": "PRO"
  },
  "debug": {
    "totalWorkoutsLogged": 150,
    "filteredWorkouts": 142
  }
}
```
