# Engineering Implementation & Technical Blueprint (Fighter Styles Edition)

## 1. Directory Structure Blueprint
Ensure all tactical asset dependencies are localized. External fetch calls are strictly prohibited.

boxing-countdown-pwa/

├── assets/
│   ├── bell.mp3            # Native round bell trigger
│   ├── countdown.mp3       # Final 10-second warning tick
│   ├── minute.mp3          # 60-second structural interval notifier
│   └── icon.png            # PWA Home screen installation asset
├── index.html              # Core layout unified with Tailwind CSS CDN
├── style.css               # Dynamic root color states & glassmorphic system
├── script.js               # Synchronous state machine & operational code
├── manifest.json           # Native standalone app environment flags
└── sw.js                   # Service Worker handling aggressive local caching
2. Core Data Models & Routine Specifications
The training engine utilizes strict deterministic mapping. Random interval processing algorithms are discarded.

const FIGHTER_ROUTINES = {
  TYSON: {
    name: "Mike Tyson",
    roundFocus: [
      "Structured warmup to maintain range and find distance",
      "Entering range and level changing",
      "Uppercut emphasis (Peek-a-boo Style)",
      "Pressure and timed evasion",
      "Body-head work and explosive power",
      "Peak volume (Volume Power)",
      "Championship round (extreme fatigue and willpower)"
    ],
    plan: [
      // Round 1
      { combo: "1", desc: "Jab only to maintain range" },
      { combo: "2", desc: "Cross only to find distance" },
      { combo: "1-2", desc: "Basic combination" },
      { combo: "1 ▲ 1", desc: "Jab, slip for defense, jab" },
      { combo: "1-2-7-2", desc: "Closing the warmup with first entry" },
      // Round 2
      { combo: "1 ▲ 3", desc: "Jab, slip, powerful left hook" },
      { combo: "2-4", desc: "Cross, powerful right hook" },
      { combo: "1 ◄ 1-2", desc: "Step left, rapid jab-cross" },
      { combo: "1-2 ▲ 3", desc: "Jab-cross, slip, left hook to body/head" },
      { combo: "3-4-3-4", desc: "Close and rapid hook sequence" },
      // Round 3
      { combo: "1-7-3", desc: "Jab, right uppercut, left hook (Classic Tyson)" },
      { combo: "2-7-4", desc: "Cross, left uppercut, right hook" },
      { combo: "1 ▲ 1-2-7-2", desc: "Jab, slip, jab-cross-uppercut-cross" },
      { combo: "1-2-7-4-2", desc: "Rolling power combination" },
      { combo: "3-4-3-4-3-4", desc: "Explosion at zero range" },
      // Round 4
      { combo: "1 ► 2-2", desc: "Step right, double cross" },
      { combo: "1 ▲ 3-3", desc: "Jab, slip, double left hook (body-head)" },
      { combo: "2 ▲ 4-4", desc: "Cross, slip, double right hook" },
      { combo: "1-2-7-3", desc: "Jab-cross, uppercut, finishing hook" },
      { combo: "1-3-7-3", desc: "Alternating left-right power sequence" },
      // Round 5
      { combo: "2-4-7-2-4", desc: "Long power sequence to break guards" },
      { combo: "1 ▲ 1", desc: "Feint low, entry WITH jab" },
      { combo: "1-2-3-7-2", desc: "Full combination from mid to close range" },
      { combo: "1-2-7-2", desc: "Rapid finish" },
      { combo: "3-4-3-4", desc: "Exhausting power sequence" },
      // Round 6
      { combo: "1-2-1-2-1-2", desc: "Continuous jab-cross barrage for distraction" },
      { combo: "1-2-7-4-2", desc: "Immediate transition to power punches" },
      { combo: "1-3-7-3", desc: "Constant pressure" },
      { combo: "2-4-7-4", desc: "Strong finish WITH right hook" },
      { combo: "1 ▲ 3-3", desc: "Slipping underneath opponent's punches" },
      // Round 7
      { combo: "1-2-3", desc: "Classic and stable combination" },
      { combo: "1-7-3", desc: "Final entry for uppercut-hook" },
      { combo: "2-4-7-2-4", desc: "Final guard dismantling" },
      { combo: "1 ▲ 1-2-7-2", desc: "Combined movement and power" },
      { combo: "1-2-1-2-1-2", desc: "Final minute: Speed and power explosion until the buzzer" }
    ]
  },
  MAYWEATHER: {
    name: "Floyd Mayweather",
    roundFocus: [
      "Structured warmup - straight punches and basic movement combination",
      "Speed and lateral movement",
      "Long and deceptive combinations",
      "Smart defense and counter-punching",
      "Pace control (Ring Generalship)",
      "Volume and mental fatigue",
      "Absolute defense round and stepping forward"
    ],
    plan: [
      // Round 1
      { combo: "1", desc: "Fast single jab (Flicker Jab)" },
      { combo: "2", desc: "Fast long-range cross" },
      { combo: "1-2", desc: "Basic straight punch combination" },
      { combo: "1 ► 2-4", desc: "Sidestep and exit with combination" },
      { combo: "1 ◄ 1-2", desc: "Step left with double jab and cross" },
      // Round 2
      { combo: "1-1-2", desc: "Fast double jab, straight cross" },
      { combo: "1 ► 2-2", desc: "Step right, fast double cross to range" },
      { combo: "1-2 ► 4", desc: "Jab-cross, step right, snap hook" },
      { combo: "1-2-3", desc: "Classic and fast three-punch combo" },
      { combo: "2 ► 1-3", desc: "Cross, step right, fast jab-hook" },
      // Round 3
      { combo: "1-2-1-2-1-2", desc: "Six fast straight punches (volume work)" },
      { combo: "1-2-3-7-2", desc: "Long combination: straights, hook, uppercut, finishing cross" },
      { combo: "1 ◄ 1-2", desc: "Constant footwork to the left" },
      { combo: "1-2-7-3", desc: "Straights, fast uppercut, disruptive hook" },
      { combo: "2-4-7-4", desc: "Quick response from the rear hand" },
      // Round 4
      { combo: "1 ▲ 1", desc: "Jab, slip back/down, returning jab" },
      { combo: "1-2 ▲ 3", desc: "Straights, pull back (Pull), fast left hook" },
      { combo: "2-4-7-2-4", desc: "Sequence of light and fast punches to overwhelm opponent" },
      { combo: "1 ► 2-4", desc: "Off the line, cross, right hook" },
      { combo: "1-1-2", desc: "Return to double jab and cross" },
      // Round 5
      { combo: "1-3-7-3", desc: "Variable combination: jab, hook, uppercut, hook" },
      { combo: "2 ► 1-3", desc: "Cross, sidestep, exit with jab-hook" },
      { combo: "1-2-7-4-2", desc: "Long and complex combination to cut angles" },
      { combo: "1 ▲ 1-2-7-2", desc: "Heavy head movement during attack" },
      { combo: "3-4-3-4-3-4", desc: "Sequence of light and fast punches to body and head" },
      // Round 6
      { combo: "1-2-1-2-1-2", desc: "Keeping hands continuously busy" },
      { combo: "1-2 ► 4", desc: "Jab-cross and exiting the opponent's angle" },
      { combo: "1-2-3-7-2", desc: "Shifting gears to long combination" },
      { combo: "1 ◄ 1-2", desc: "Defense through footwork" },
      { combo: "2-4", desc: "Snap cross-hook, fast" },
      // Round 7
      { combo: "1 ▲ 1", desc: "Passive-active distance management" },
      { combo: "1-2-7-2", desc: "Four fast straight punches to the center" },
      { combo: "2-4-7-2-4", desc: "Final rhythm break" },
      { combo: "1 ► 2-4", desc: "Final step out of range" },
      { combo: "1-2-1-2-1-2", desc: "Final minute: Absolute and light speed sprint until the buzzer" }
    ]
  },
  ALI: {
    name: "Muhammad Ali",
    roundFocus: [
      "Structured warmup - straight work and long-range management",
      "Ring dance and lateral movement (The Ali Shuffle)",
      "Pace variation and disruptive jab (The Flicker Jab)",
      "Fighting on the backfoot",
      "Explosive attacks (Showboating & Speed)",
      "Late-round pressure",
      "Championship round (fatigue and mental speed)"
    ],
    plan: [
      // Round 1
      { combo: "1", desc: "Fast single jab (Flicker)" },
      { combo: "2", desc: "Long straight cross" },
      { combo: "1-2", desc: "Basic straight punch combination" },
      { combo: "1-1-2", desc: "Double jab and cross" },
      { combo: "1 ▲ 1", desc: "Jab, head lean back, returning jab" },
      // Round 2
      { combo: "1 ◄ 1-2", desc: "Jab, step left, fast jab-cross" },
      { combo: "1 ► 2-2", desc: "Jab, step right, double cross to range" },
      { combo: "1-2-1-2", desc: "Four fast straight punches from stationary position" },
      { combo: "1-2 ► 4", desc: "Straights, step right, exit with snap hook" },
      { combo: "3-4-3-4", desc: "Fast hook sequence at head height" },
      // Round 3
      { combo: "1-1-1", desc: "Fast triple jab for distraction and distance" },
      { combo: "1-2-3", desc: "Classic and smooth three-punch combo" },
      { combo: "2-4-7-4", desc: "Quick transition to long-range power punches" },
      { combo: "1 ▲ 1-2-7-2", desc: "Jab, body lean, fluid combination" },
      { combo: "1-2-1-2-1-2", desc: "Straight punch sprint (high volume)" },
      // Round 4
      { combo: "1 ▲ 1", desc: "Head pull back (Lean back) and jab while stepping back" },
      { combo: "2 ► 1-3", desc: "Cross, sidestep, fast jab-hook" },
      { combo: "1-2-7-3", desc: "Straights, surprise uppercut, finishing hook" },
      { combo: "1 ◄ 1-2", desc: "Movement left to break attack line" },
      { combo: "1-3-7-3", desc: "Fast and complex hand combination" },
      // Round 5
      { combo: "1-2-1-2-1-2", desc: "Barrage of fast punches to the face" },
      { combo: "2-4", desc: "Fast cross and hook, exit outward" },
      { combo: "1-2-3-7-2", desc: "Full combination starting far and ending close" },
      { combo: "1 ► 2-4", desc: "Step right, cross, right hook" },
      { combo: "3-4-3-4-3-4", desc: "Short hook explosion" },
      // Round 6
      { combo: "1-1-2", desc: "Return to basics: aggressive double jab and cross" },
      { combo: "1-2-7-4-2", desc: "Long punch sequence creating mental pressure" },
      { combo: "1 ▲ 3", desc: "Jab, slip aside, fast left hook" },
      { combo: "2-4-7-2-4", desc: "Fast sequence exchanges" },
      { combo: "1 ◄ 1-2", desc: "Quick exit from opponent's range" },
      // Round 7
      { combo: "1-1-1", desc: "Using the jab to hold distance" },
      { combo: "1-2-3", desc: "Clean and sharp combination" },
      { combo: "1-2-7-2", desc: "Four fast punches to the center" },
      { combo: "1 ► 2-4", desc: "Final step aside and counter punch combination" },
      { combo: "1-2-1-2-1-2", desc: "Final minute: Absolute straight punch sprint until the final buzzer" }
    ]
  }
};
3. Local State Machine Architecture
Tracks exact structural flow variables. LocalStorage reads mapping parameters directly to prevent configuration loss.

JavaScript
JavaScript
const runtimeEngineState = {
  selectedFighterKey: 'TYSON',      // TYSON | MAYWEATHER | ALI
  configuredRoundsCount: 7,         // Modifiable via steppers (max 24)
  activeSessionSeconds: 0,          // Absolute cumulative timeline clock
  activePhaseSeconds: 0,            // Component down-counter ticker matching phase values
  currentPhase: 'SETUP',            // SETUP | WARMUP | WORK | REST | FINISHED
  activeRoundIndex: 1,              // Integer progression tracker
  isMuted: false,                   // Supresses browser AudioContext execution
  tickerId: null                    // References continuous setInterval loop instances
};
4. Layout & UI Component Architecture Spec
UI Screen Context Switcher: Router handling DOM views toggling visibility classes dynamically (display: none / display: flex) mapped to runtimeEngineState.currentPhase.

Strict 50/50 Operational HUD Grid:

Left Screen Viewport Panel (Chrono): Dedicated entirely to timing telemetry. Displays the main clock (main-timer) and elapsed absolute session time (activeSessionSeconds) using tabular lining variables to prevent graphic layout shaking.

Right Screen Viewport Panel (Tactical Data): Tracks tactical movement execution. Contains dynamic combo element rows parsed into structural hardware boxes and description mapping labels.

5. Algorithmic Processing Loops
Step A: Low-Latency Audio Core
Utilizes browser asynchronous subroutines to avoid exclusive audio context acquisition, allowing undisturbed coexistence with ambient processes like Spotify background signals.

JavaScript
JavaScript
const audioBuffers = {};
let audioContextInstance = null;

async function initializeAudioEngine() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContextInstance = new AudioContextClass();
  
  const targets = {
    bell: './assets/bell.mp3',
    minute: './assets/minute.mp3',
    countdown: './assets/countdown.mp3'
  };
  
  for (const [key, path] of Object.entries(targets)) {
    const response = await fetch(path);
    const buffer = await response.arrayBuffer();
    audioBuffers[key] = await audioContextInstance.decodeAudioData(buffer);
  }
}

function triggerLocalAudioSignal(name) {
  if (runtimeEngineState.isMuted || !audioBuffers[name]) return;
  
  const source = audioContextInstance.createBufferSource();
  source.buffer = audioBuffers[name];
  source.connect(audioContextInstance.destination);
  source.start(0);
}
Step B: Dynamic Text Transformation Compiler
Parses combination strings containing custom glyph configurations (▲, ►, ◄) or plain formatting tokens directly into glowing tactical viewports.

JavaScript
JavaScript
function renderStructuredComboHTML(comboString, descriptorText) {
  const elements = comboString.split(/(\s+|-|▲|►|◄)/);
  let parsedHTML = `<div class="flex items-center justify-center gap-4">`;
  
  elements.forEach(item => {
    const trimmed = item.trim();
    if (!trimmed) return;
    
    if (["-", "▲", "►", "◄"].includes(trimmed)) {
      let iconName = "arrow_forward";
      if (trimmed === "▲") iconName = "keyboard_double_arrow_up";
      if (trimmed === "►") iconName = "keyboard_double_arrow_right";
      if (trimmed === "◄") iconName = "keyboard_double_arrow_left";
      parsedHTML += `<span class="material-symbols-outlined text-primary-container text-2xl">${iconName}</span>`;
    } else if (/^\d+$/.test(trimmed)) {
      parsedHTML += `
        <div class="flex flex-col items-center glass-panel px-4 py-2 rounded">
          <span class="font-display-timer text-5xl text-on-surface font-bold">${trimmed}</span>
        </div>`;
    }
  });
  
  parsedHTML += `</div><p class="font-body-md text-on-surface-variant text-center mt-4">${descriptorText}</p>`;
  return parsedHTML;
}
Step C: Ticker Progression & Time Truncation Pipeline
Manages 1-second ticks linearly without legacy random deck arrays. Evaluates timeline points directly against selected routine matrices.

JavaScript
JavaScript
function handleEngineCoreTick() {
  runtimeEngineState.activePhaseSeconds--;
  runtimeEngineState.activeSessionSeconds++;

  if (runtimeEngineState.currentPhase === 'WARMUP') {
    // Isolated baseline 2-minute warmup check
    if (runtimeEngineState.activePhaseSeconds <= 0) {
      transitionToWorkPhase();
    }
  } else if (runtimeEngineState.currentPhase === 'WORK') {
    // 1. Evaluate specific internal round indices via 60-second slice math
    let timeElapsedInRound = 300 - runtimeEngineState.activePhaseSeconds;
    
    if (runtimeEngineState.activePhaseSeconds > 0 && timeElapsedInRound % 60 === 0) {
      triggerLocalAudioSignal('minute');
      compileActiveDirectivesDisplay();
    }
  }

  // Warning check at the 10-second mark
  if (runtimeEngineState.activePhaseSeconds === 10) {
    triggerLocalAudioSignal('countdown');
  }

  if (runtimeEngineState.activePhaseSeconds <= 0 && runtimeEngineState.currentPhase !== 'WARMUP') {
    processPhaseTransitionLifecycle();
  }

  updateDomInterfaceElements();
}

function compileActiveDirectivesDisplay() {
  const currentRoutine = FIGHTER_ROUTINES[runtimeEngineState.selectedFighterKey];
  let timeElapsedInRound = 300 - runtimeEngineState.activePhaseSeconds;
  let activeMinuteMarker = Math.floor(timeElapsedInRound / 60);
  
  // Guard loop tracking overflow thresholds cleanly
  let computedGlobalIndex = ((runtimeEngineState.activeRoundIndex - 1) * 5) + activeMinuteMarker;
  let optimizedIndex = computedGlobalIndex % currentRoutine.plan.length;
  
  const targetStep = currentRoutine.plan[optimizedIndex];
  const targetHTML = renderStructuredComboHTML(targetStep.combo, targetStep.desc);
  document.getElementById('combo-container-node').innerHTML = targetHTML;
}