# Product Requirement Document: Boxing Pro Trainer - Smart Trainer Upgrade

**Role:** Expert Product Manager & Strategist
**Product:** Boxing Pro Trainer (PWA)
**Goal:** Transform the MVP into a "Smart Trainer" data-driven application.

---

## 1. Mobile-First & PWA Installability

### Requirement
The application must function as a Trusted Web Activity (TWA) or Native App on Android Chrome, providing an immersive, app-like experience without the browser URL bar.

### Manifest Configuration
A strict `manifest.json` is required to ensure the app is installable and launches correctly.

*   **Display:** `standalone` (Removes URL bar).
*   **Orientation:** `landscape` (Preferred, but see Orientation Logic below).
*   **Theme Color:** `#0b0b0b` (Matches background).
*   **Icons:** Must include standard sizes (192x192, 512x512) and a maskable icon.

### Orientation Logic (The "Tablet Landscape" Simulation)
The user's mental model of the dashboard is a wide, landscape control panel. On mobile phones (portrait), the UI must strictly simulate this layout rather than stacking vertically.

*   **Strategy:** Force Landscape.
*   **Implementation:**
    *   If the device is in portrait mode, the app container will rotate 90 degrees (`transform: rotate(90deg)`) and adjust dimensions (`width: 100vh`, `height: 100vw`) to fill the screen.
    *   The user effectively holds the phone sideways, even if the system rotation is locked to portrait.
    *   **CSS Grid:** The layout will maintain the 2-column "Dashboard Grid" (Left: Setup/Timer, Right: Controls/Combos) regardless of device type.

---

## 2. Data & Analytics (Bi-Directional Sync)

### Logic
*   **Current:** One-way write to Google Sheets.
*   **Upgrade:** Bi-directional sync. Read user stats on load.
*   **Filter:** Only log workouts that last **> 10 minutes** (Total Session Time) to avoid skewing data with test runs.

### Dashboard (Stats Display)
On application load, fetch and display the following metrics:
1.  **Average Workouts per Week** (Last 4 weeks rolling).
2.  **Average Duration per Session** (Minutes).
3.  **Average Difficulty Level** (Mode or Weighted Avg).

---

## 3. Training Logic (The "Smart Randomizer")

The pattern generation logic will be upgraded to be less repetitive and more structured.

### Phase A: Fixed Warm-up (First 3 Minutes)
For the first 3 minutes of "Work" time (approx. Round 1), the app will strictly cycle through basic combos to build rhythm:
1.  `"1"` (Jab)
2.  `"1-2"` (Jab-Cross)
3.  `"1-2-3"` (Jab-Cross-Hook)
*Repeat sequence.*

### Phase B: Random Loop (Deck of Cards Algorithm)
After minute 3, the app switches to the "Smart Randomizer".
*   **Concept:** Think of the combo pool as a deck of cards.
*   **Algorithm:**
    1.  Shuffle the entire available combo pool.
    2.  Draw combos one by one.
    3.  **Constraint:** No combo is repeated until the entire "deck" (pool) has been shown once.
    4.  Once the deck is empty, reshuffle and start again.

---

## 4. Audio Control

### Requirement
Add a Global Mute Toggle to the UI.

### Logic
*   **State:** Persist mute state in `localStorage`.
*   **UI:** A speaker icon button (Muted/Unmuted) visible on both Setup and Timer screens.
*   **Behavior:** When muted, `bell.play()`, `minute.play()`, and `countdown.play()` are suppressed.

---

## Technical Deliverables & Specs

### A. Feature Hierarchy (Stats vs. Timer)

**Organization:**
The application has two main "Modes": **Dashboard (Setup)** and **Workout (Timer)**.

1.  **Dashboard Mode (Home):**
    *   **Header:** App Title + Global Mute Toggle.
    *   **Top Section (The "Stats Bar"):** A horizontal row of 3 cards displaying the fetched stats (W/O per Week, Avg Duration, Avg Level).
        *   *Loading State:* Pulsing skeleton loaders.
    *   **Middle Section (Setup):** The existing Difficulty Selectors and Round Counter.
    *   **Bottom Section:** "Start Fight" CTA.

2.  **Workout Mode (Timer):**
    *   **Focus:** The Timer and Combo Display take up 90% of the screen.
    *   **Stats:** Hidden during workout to minimize distraction.
    *   **Controls:** Mute toggle remains accessible (small, corner).

### B. User Flow (Data Fetching)

1.  **Initialization:**
    *   App Launch.
    *   Check `localStorage` for `boxingUserId` (UUID). If missing, generate one and save it.
2.  **Fetching (Async):**
    *   Render Dashboard with "Skeleton" stats (gray bars).
    *   Trigger `fetch(GOOGLE_SCRIPT_URL + '?action=getStats&userId=' + uuid)`.
3.  **Response Handling:**
    *   **Success:** Parse JSON. Replace Skeletons with numbers. Animate the numbers counting up (optional polish).
    *   **Error/Offline:** Replace Skeletons with "—" or a "Local Mode" icon. Do not block the "Start Fight" button.
4.  **Submission (Post-Workout):**
    *   If `TotalDuration > 10 mins`: `POST` data including `userId` to the Script.

### C. Data Structure Suggestion

**Google Apps Script Response (JSON):**

```json
{
  "status": "success",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "stats": {
    "workoutsPerWeek": 3.5,
    "avgDurationMinutes": 45,
    "avgDifficulty": "PRO",
    "totalWorkouts": 124
  },
  "message": "Stats retrieved successfully"
}
```

**Google Sheet Columns (Database Schema):**

| Column | Header | Type | Description |
| :--- | :--- | :--- | :--- |
| **A** | `timestamp` | Date/Time | ISO String or Sheet Date |
| **B** | `userId` | String | UUID for user identification |
| **C** | `difficulty` | String | ROOKIE, PRO, CHAMP |
| **D** | `rounds_completed` | Number | Integer |
| **E** | `total_duration_minutes` | Number | Total session length |
| **F** | `date_only` | String | YYYY-MM-DD (Helper for aggregation) |

**Aggregation Logic (in Google Script):**
*   **Workouts/Week:** Filter by `userId`. Group by Week #. Average the counts.
*   **Avg Duration:** Filter by `userId`. Average `total_duration_minutes`.
*   **Avg Difficulty:** Filter by `userId`. Find mode of `difficulty`.
