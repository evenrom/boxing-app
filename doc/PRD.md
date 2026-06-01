\# Product Requirement Document (PRD) - Boxing Countdown PWA



\## 1. Project Overview \& Scope

\- \*\*Product Name\*\*: Boxing Countdown

\- \*\*Target Persona\*\*: Single-user deployment for local, offline gym training on tablet hardware.

\- \*\*Orientation\*\*: Strict Landscape orientation layout. No device viewport wrapping or adaptive column-stacking.

\- \*\*Budget / Architecture Constraint\*\*: Zero-Cost, Client-Side only deployment. No database cloud infrastructure, no remote API configurations.



\## 2. Core Functional Requirements

\- \*\*Dashboard Configuration Mode\*\*:

&#x20; - Intensity Selection Pane: Direct selection between ROOKIE (3 min work / 20s rest), PRO (5 min work / 30s rest), and CHAMP (10 min work / 60s rest).

&#x20; - Round Allocation Controls: Increment/decrement steppers modifying target total rounds.

&#x20; - Contextual Metadata Display: Dynamically computed workout sequence duration calculation ("TOTAL TIME: MM:SS").

\- \*\*Active Telemetry Training Mode\*\*:

&#x20; - Split-Panel View Layout: Fixed 50/50 horizontal width allocation. Left zone isolates countdown clocks; Right zone aggregates combination execution instructions.

&#x20; - State Synchronized Accents: Electric Cyan visualization during high-intensity intervals; Matrix Green breathing effects applied during scheduled rest cycles.

&#x20; - Global Mute Interrupter: Persistence-configured UI interrupter preventing localized browser application sound output without capturing exclusive system hardware audio channels.



\## 3. Core Training Engine \& Logic Specs

\- \*\*Phase 1: Global Chrono Warmup Sequence\*\*:

&#x20; - Execution Interval: Enforced for the exact initial 180 seconds of aggregate elapsed execution time.

&#x20; - Display Interface: Left side renders down-counter; Right side displays text asset "BREATHE" / "GET READY".

&#x20; - Combo Array Bypass: Pure linear routing. Suppresses random generator processing.

\- \*\*Phase 2: Tactical Combination Array Shuffling\*\*:

&#x20; - Core Processing Concept: "Deck of Cards" non-repeating constraint sequence logic.

&#x20; - Functional Step 1: Clone master repository collection containing target boxing combination data models.

&#x20; - Functional Step 2: Apply Fisher-Yates array permutation logic to randomize current active target matrix index orders.

&#x20; - Functional Step 3: Iterate sequentially through permutation array paths, flashing current tactical indicators on a clean 60-second operational loop ticker.

&#x20; - Functional Step 4: Enforce unique constraint rules preventing single-element re-processing until complete pool iteration returns exhaustion state flags. Trigger reshuffle sequence instantly on buffer drop.



\## 4. Audio Processing Constraints

\- \*\*Concurrent Coexistence Matrix\*\*:

&#x20; - The PWA internal signal generator must operate asynchronously alongside external audio playback services (e.g., Spotify background streams).

&#x20; - Suppress programmatic requests capturing explicit hardware Exclusive Audio Focus states.

\- \*\*Hardware Trigger Compliance\*\*:

&#x20; - Initialize, load, and warm browser underlying Web Audio Context subroutines immediately following explicit client interaction events (e.g., Target pointer tap action context detected on "START FIGHT" component node).



\## 5. Localized Storage Scheme

\- \*\*Variable Key Registers\*\*:

&#x20; - `boxing\_current\_intensity`: Text string mapping current operational mode parameters (`ROOKIE` / `PRO` / `CHAMP`).

&#x20; - `boxing\_allocated\_rounds`: Numerical allocation tracking intended iteration targets.

&#x20; - `boxing\_system\_mute\_flag`: Boolean value indicating global app sound suppression.

