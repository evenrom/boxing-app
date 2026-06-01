if (typeof document === 'undefined') {
    globalThis.document = {
        addEventListener: () => null,
        getElementById: () => ({ innerText: '', style: {}, classList: { add: () => null, remove: () => null } }),
        querySelectorAll: () => [],
        querySelector: () => null,
        body: { classList: { add: () => null, remove: () => null } }
    };
}
if (typeof window === 'undefined') {
    globalThis.window = globalThis;
}
if (typeof localStorage === 'undefined') {
    globalThis.localStorage = {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null
    };
}

if (typeof document === 'undefined') {
    global.document = {
        addEventListener: () => null,
        getElementById: () => ({ innerText: '', style: {}, classList: { add: () => null, remove: () => null } }),
        querySelectorAll: () => [],
        querySelector: () => null,
        body: { classList: { add: () => null, remove: () => null } }
    };
}
if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    global.localStorage = {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null
    };
}

// --- CONFIGURATION ---

// --- AUDIO ASSETS ---
const audioContextOptions = {
  bell: './assets/bell.mp3',
  minute: './assets/minute.mp3',
  countdown: './assets/countdown.mp3'
};
const audioBuffers = {};
let audioCtx = null;
let audioEngineInitialized = false;

async function initializeAudioEngine() {
  if (audioEngineInitialized) return;
  try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      for (const [key, path] of Object.entries(audioContextOptions)) {
          try {
              const response = await fetch(path);
              const arrayBuffer = await response.arrayBuffer();
              audioBuffers[key] = await audioCtx.decodeAudioData(arrayBuffer);
          } catch(e) {
              console.warn("Failed to load audio asset: " + path, e);
          }
      }
      audioEngineInitialized = true;
  } catch(e) {
      console.warn("Web Audio API not supported or failed to init", e);
  }
}

function playSound(name) {
    if (!appState.settings.isMuted && audioCtx && audioBuffers[name]) {
        try {
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffers[name];
            source.connect(audioCtx.destination);
            source.start(0);
        } catch(e) {
            console.warn("Failed to play sound: " + name, e);
        }
    }
}
// --- DIFFICULTY SETTINGS (FIXED ROUNDS) ---

const CONFIG = {
    'ROOKIE': { round: 180, rest: 20, defaultRounds: 8 },
    'PRO':    { round: 300, rest: 30, defaultRounds: 6 },
    'CHAMP':  { round: 600, rest: 60, defaultRounds: 4 }
};

// --- WORKOUT PLAN (FLAT SEQUENCE) ---
// Each line = 60 Seconds of work
const WORKOUT_PLAN = [
    "1",
    "1-2",
    "1-2-3",
    "1 ▲ 1",
    "1-2-7-2",
    "2-4",
    "1-1-2",
    "1-2 ► 4",
    "1-3",
    "1-2-7-3",
    "1 ◄ 1-2",
    "1-3-7-3",
    "2-4-7-4",
    "1-2-7-2",
    "1-2 ▲ 3",
    "1-2-7-4-2",
    "2 ▲ 4-4",
    "1 ▲ 3-3",
    "1-3-7-3",
    "2-4-7-4",
    "1 ► 2-2",
    "1-2-1-2-1-2",
    "3-4-3-4-3-4",
    "2 ► 1-3",
    "1 ► 2-4",
    "1-7-3",
    "2-7-4",
    "1 ▲ 1-2-7-2",
    "2-4-7-2-4",
    "1-2-3-7-2"
];

// --- STATE MANAGEMENT ---
const appState = {
  settings: {
    intensity: 'PRO',
    targetRounds: 6,
    isMuted: false
  },
  engine: {
    phase: 'SETUP',
    currentRound: 1,
    elapsedPhaseSeconds: 0,
    elapsedTotalSeconds: 0,
    workSecondsGlobal: 0,
    timer: null
  },
  pools: {
    masterCombos: [
      "1", "1-2", "1-2-3", "1 ▲ 1", "1-2-7-2", "2-4", "1-1-2",
      "1-2 ► 4", "1-3", "1-2-7-3", "1 ◄ 1-2", "1-3-7-3", "2-4-7-4",
      "1-2-7-2", "1-2 ▲ 3", "1-2-7-4-2", "2 ▲ 4-4", "1 ▲ 3-3",
      "1-3-7-3", "2-4-7-4", "1 ► 2-2", "1-2-1-2-1-2", "3-4-3-4-3-4",
      "2 ► 1-3", "1 ► 2-4", "1-7-3", "2-7-4", "1 ▲ 1-2-7-2", "2-4-7-2-4", "1-2-3-7-2"
    ],
    shuffledDeck: [],
    activeComboIndex: 0,
    currentActiveCombo: null
  },
  wakeLock: null
};

function saveSettings() {
    try {
        const settingsObj = {
            intensity: appState.settings.intensity,
            allocated_rounds: appState.settings.targetRounds,
            system_mute_flag: appState.settings.isMuted
        };
        localStorage.setItem('boxing_system_settings', JSON.stringify(settingsObj));
    } catch(e) {
        console.warn('Failed to save boxing_system_settings', e);
    }
}

function loadSettings() {
    try {
        const stored = localStorage.getItem('boxing_system_settings');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.intensity) appState.settings.intensity = parsed.intensity;
            if (parsed.allocated_rounds) appState.settings.targetRounds = parsed.allocated_rounds;
            if (parsed.system_mute_flag !== undefined) appState.settings.isMuted = parsed.system_mute_flag;
        }
    } catch(e) {
        console.warn('Failed to parse boxing_system_settings', e);
    }
}
// --- INITIALIZATION ---


document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateMuteIcon();
    app.selectDiff(appState.settings.intensity);
    
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered', reg))
            .catch(err => console.log('SW Failed', err));
    }

    // Event Listeners
    document.getElementById('muteBtn').onclick = toggleMute;
    document.getElementById('btn-start-fight').onclick = startWorkout;
    document.getElementById('pauseBtn').onclick = togglePause;
    document.getElementById('stopBtn').onclick = endWorkout;
    document.getElementById('btn-restart').onclick = resetApp;
    document.getElementById('btn-minus').onclick = () => changeRounds(-1);
    document.getElementById('btn-plus').onclick = () => changeRounds(1);

    fetchStats();
});

// --- APP LOGIC ---
const app = {
    selectDiff: (lvl) => {
        appState.settings.intensity = lvl;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('btn-' + lvl.toLowerCase());
        if(btn) btn.classList.add('active');
        
        appState.settings.targetRounds = CONFIG[lvl].defaultRounds;
        
        document.getElementById('setupRoundCount').innerText = appState.settings.targetRounds;
        updateTotalTimePreview();
        saveSettings();
    }
};

function changeRounds(delta) {
    appState.settings.targetRounds = Math.max(1, appState.settings.targetRounds + delta);
    document.getElementById('setupRoundCount').innerText = appState.settings.targetRounds;
    updateTotalTimePreview();
    saveSettings();
}

function updateTotalTimePreview() {
    const total = calculateTotalTime();
    document.getElementById('totalTimePreview').innerText = formatTime(total);
}

function calculateTotalTime() {
    const cfg = CONFIG[appState.settings.intensity];
    return 180 + (appState.settings.targetRounds * cfg.round) + ((appState.settings.targetRounds - 1) * cfg.rest); // 180s for warmup
}

// --- WORKOUT ENGINE ---
function executeDeckShuffle() {
  let sourceArray = [...appState.pools.masterCombos];
  let iterations = sourceArray.length;

  while (iterations !== 0) {
    let randomIndex = Math.floor(Math.random() * iterations);
    iterations--;

    let temporaryValue = sourceArray[iterations];
    sourceArray[iterations] = sourceArray[randomIndex];
    sourceArray[randomIndex] = temporaryValue;
  }

  appState.pools.shuffledDeck = sourceArray;
  appState.pools.activeComboIndex = 0;
}

function retrieveNextTacticalCombo() {
  if (appState.pools.shuffledDeck.length === 0 ||
      appState.pools.activeComboIndex >= appState.pools.shuffledDeck.length) {
    executeDeckShuffle();
  }

  const currentCombo = appState.pools.shuffledDeck[appState.pools.activeComboIndex];
  appState.pools.activeComboIndex++;
  return currentCombo;
}
// --- WORKOUT ENGINE ---


async function startWorkout() {
    await initializeAudioEngine();
    appState.engine.phase = 'warmup';
    appState.engine.currentRound = 0;
    appState.engine.elapsedPhaseSeconds = 180;
    appState.engine.workSecondsGlobal = 0;
    appState.engine.elapsedTotalSeconds = calculateTotalTime();
    
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('timer-screen').style.display = 'flex';
    
    requestWakeLock();
    playSound('bell');
    
    if (appState.engine.timer) clearInterval(appState.engine.timer);
    appState.engine.timer = setInterval(handleEngineCoreTick, 1000);
    updateTimerUI();
}

function handleEngineCoreTick() {
    if (document.getElementById('pauseBtn').innerText === "RESUME") return;

    appState.engine.elapsedPhaseSeconds--;
    appState.engine.elapsedTotalSeconds--;
    
    if (appState.engine.phase === 'work') {
        appState.engine.workSecondsGlobal++;

        if (appState.engine.elapsedPhaseSeconds > 0 && appState.engine.elapsedPhaseSeconds % 60 === 0) {
            playSound('minute');
        }
    }

    if (appState.engine.elapsedPhaseSeconds <= 0) {
        transitionWorkoutLifecyclePhase();
    }
    
    if (appState.engine.elapsedPhaseSeconds === 10) playSound('countdown');

    updateTimerUI();
}

function transitionWorkoutLifecyclePhase() {
    playSound('bell');
    const cfg = CONFIG[appState.settings.intensity];

    if (appState.engine.phase === 'warmup') {
        appState.engine.phase = 'work';
        appState.engine.currentRound = 1;
        appState.engine.elapsedPhaseSeconds = cfg.round;
    } else if (appState.engine.phase === 'work') {
        if (appState.engine.currentRound >= appState.settings.targetRounds) {
            finishSession();
            return;
        }
        appState.engine.phase = 'rest';
        appState.engine.elapsedPhaseSeconds = cfg.rest;
    } else if (appState.engine.phase === 'rest') {
        appState.engine.phase = 'work';
        appState.engine.currentRound++;
        appState.engine.elapsedPhaseSeconds = cfg.round;
    }
}

function updateTimerUI() {
    document.getElementById('mainTimer').innerText = formatTime(appState.engine.elapsedPhaseSeconds);
    document.getElementById('totalTimer').innerText = formatTime(appState.engine.elapsedTotalSeconds);
    
    const status = document.getElementById('statusText');
    const body = document.body;

    if (appState.engine.phase === 'work') {
        body.classList.remove('rest-mode');
        status.innerText = 'ROUND ' + appState.engine.currentRound;
        
        const workSecs = appState.engine.workSecondsGlobal;
        let currentCombo, nextCombo;
        
        // Retrieve from shuffle deck on minute marks
        if (appState.engine.elapsedPhaseSeconds % 60 === 0 && appState.engine.elapsedPhaseSeconds > 0) {
            appState.pools.currentActiveCombo = retrieveNextTacticalCombo();
        }
        if (!appState.pools.currentActiveCombo) {
            appState.pools.currentActiveCombo = retrieveNextTacticalCombo();
        }
        currentCombo = appState.pools.currentActiveCombo;
        nextCombo = appState.pools.shuffledDeck[appState.pools.activeComboIndex] || "BREATHE";

        document.getElementById('currentPattern').innerHTML = parseIcons(currentCombo);
        document.getElementById('nextPattern').innerHTML = parseIcons(nextCombo);
        
    } else {
        body.classList.add('rest-mode');
        status.innerText = appState.engine.phase === 'warmup' ? "WARM UP" : "REST";
        document.getElementById('currentPattern').innerText = "BREATHE";
        
        if (appState.engine.phase === 'rest') {
            document.getElementById('nextPattern').innerText = 'NEXT: ROUND ' + (appState.engine.currentRound + 1);
        } else {
            document.getElementById('nextPattern').innerText = "GET READY";
        }
    }
}

// --- DATA & SYNC ---

function finishSession() {
    if (appState.engine.timer) clearInterval(appState.engine.timer);
    if (appState.wakeLock) appState.wakeLock.release();

    const totalDurationMin = Math.round(appState.engine.workSecondsGlobal / 60);
    if (totalDurationMin >= 1) {
        logWorkout(totalDurationMin);
    }

    document.getElementById('timer-screen').style.display = 'none';
    document.getElementById('finish-screen').style.display = 'flex';
    document.getElementById('finishRoundsVal').innerText = appState.settings.targetRounds;
}

function logWorkout(mins) {
    if (mins < 1) return;
    try {
        const history = getWorkoutHistory();
        const newRecord = {
            workout_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
            timestamp: new Date().toISOString(),
            intensity: appState.settings.intensity,
            rounds_completed: appState.engine.currentRound,
            duration_minutes: mins
        };
        history.push(newRecord);
        localStorage.setItem('boxing_workout_history', JSON.stringify(history));
        console.log('Workout Logged Locally', newRecord);
    } catch(e) {
        console.warn('Failed to log workout to localStorage', e);
    }
}

function getWorkoutHistory() {
    try {
        const stored = localStorage.getItem('boxing_workout_history');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch(e) {
        console.warn('Failed to parse boxing_workout_history', e);
    }
    return [];
}

function fetchStats() {
    const history = getWorkoutHistory();
    if (history.length === 0) return;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentWorkouts = history.filter(w => new Date(w.timestamp) >= oneWeekAgo);

    let totalDuration = 0;
    const intensityCounts = {};

    history.forEach(w => {
        totalDuration += (w.duration_minutes || 0);
        intensityCounts[w.intensity] = (intensityCounts[w.intensity] || 0) + 1;
    });

    const avgDuration = Math.round(totalDuration / history.length);

    let maxCount = 0;
    let avgLevel = '-';
    for (const [level, count] of Object.entries(intensityCounts)) {
        if (count > maxCount) {
            maxCount = count;
            avgLevel = level;
        }
    }

    const statWeekly = document.getElementById('stat-weekly');
    if (statWeekly) statWeekly.innerText = recentWorkouts.length;

    const statDuration = document.getElementById('stat-duration');
    if (statDuration) statDuration.innerText = avgDuration;

    const statLevel = document.getElementById('stat-level');
    if (statLevel) statLevel.innerText = avgLevel;
}

// --- HELPERS ---

function toggleMute() {
    appState.settings.isMuted = !appState.settings.isMuted;
    saveSettings();
    updateMuteIcon();
}

function updateMuteIcon() {
    const icon = document.querySelector('#muteBtn span');
    if(icon) {
        icon.innerText = appState.settings.isMuted ? 'volume_off' : 'volume_up';
        icon.style.opacity = appState.settings.isMuted ? '0.5' : '1';
    }
}
function playSound(name) {
    if (!appState.settings.isMuted && audioCtx && audioBuffers[name]) {
        try {
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffers[name];
            source.connect(audioCtx.destination);
            source.start(0);
        } catch(e) {
            console.warn("Failed to play sound: " + name, e);
        }
    }
}

function parseIcons(text) {
    if(!text) return '';
    return text.replace(/▲/g,'<span class="material-symbols-outlined">keyboard_double_arrow_up</span>')
                .replace(/▼/g,'<span class="material-symbols-outlined">keyboard_double_arrow_down</span>')
                .replace(/◄/g,'<span class="material-symbols-outlined">keyboard_double_arrow_left</span>')
                .replace(/►/g,'<span class="material-symbols-outlined">keyboard_double_arrow_right</span>');
}

function formatTime(s) {
    if (s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try { appState.wakeLock = await navigator.wakeLock.request('screen'); } catch(e){}
    }
}

function togglePause() {
    const btn = document.getElementById('pauseBtn');
    if (btn.innerText === "PAUSE") {
        btn.innerText = "RESUME";
    } else {
        btn.innerText = "PAUSE";
    }
}

function endWorkout() {
    finishSession(); 
}

function resetApp() {
    location.reload();
}
