// --- CONFIGURATION & AUDIO ASSETS ---
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

const FIGHTER_ROUTINES = {
  TYSON: {
    name: "Mike Tyson",
    roundFocus: [
      "חימום: שמירת טווח",
      "כניסה לטווח ושינוי גובה",
      "דגש אפרקטים",
      "לחץ והתחמקות מתוזמנת",
      "גוף-ראש ועוצמה",
      "שיא העומס",
      "סיבוב אליפות"
    ],
    plan: [
      { combo: "1", desc: "ג'אב טווח" },
      { combo: "2", desc: "קרוס מרחק" },
      { combo: "1-2", desc: "שילוב בסיסי" },
      { combo: "1 ▲ 1", desc: "ג'אב, חמיקה, ג'אב" },
      { combo: "1-2-7-2", desc: "סגירת חימום" },
      { combo: "1 ▲ 3", desc: "ג'אב, חמיקה, הוק שמאל" },
      { combo: "2-4", desc: "קרוס, הוק ימין עוצמתי" },
      { combo: "1 ◄ 1-2", desc: "צעד שמאל, ג'אב-קרוס" },
      { combo: "1-2 ▲ 3", desc: "ג'אב-קרוס, חמיקה, הוק גוף" },
      { combo: "3-4-3-4", desc: "הוקים מהירים בטווח קצר" },
      { combo: "1-7-3", desc: "ג'אב, אפרקט, הוק קלאסי" },
      { combo: "2-7-4", desc: "קרוס, אפרקט שמאל, הוק ימין" },
      { combo: "1 ▲ 1-2-7-2", desc: "ג'אב, חמיקה, רצף כוח" },
      { combo: "1-2-7-4-2", desc: "קומבינציית כוח מתגלגלת" },
      { combo: "3-4-3-4-3-4", desc: "התפוצצות בטווח אפס" },
      { combo: "1 ► 2-2", desc: "צעד ימין, קרוס כפול" },
      { combo: "1 ▲ 3-3", desc: "חמיקה, הוק כפול גוף-ראש" },
      { combo: "2 ▲ 4-4", desc: "קרוס, חמיקה, הוק ימין כפול" },
      { combo: "1-2-7-3", desc: "ג'אב-קרוס, אפרקט, הוק" },
      { combo: "1-3-7-3", desc: "רצף כוח שמאלי-ימני" },
      { combo: "2-4-7-2-4", desc: "רצף ארוך לשבירת הגנה" },
      { combo: "1 ▲ 1", desc: "הטעיה למטה, ג'אב בכניסה" },
      { combo: "1-2-3-7-2", desc: "טווח בינוני לקרוב" },
      { combo: "1-2-7-2", desc: "פיניש מהיר" },
      { combo: "3-4-3-4", desc: "רצף מתיש" },
      { combo: "1-2-1-2-1-2", desc: "מטר ג'אב-קרוס להסחת דעת" },
      { combo: "1-2-7-4-2", desc: "מעבר מיידי למכות כוח" },
      { combo: "1-3-7-3", desc: "לחץ מתמיד" },
      { combo: "2-4-7-4", desc: "סיומת חזקה עם הוק" },
      { combo: "1 ▲ 3-3", desc: "כניסה מתחת למכות יריב" },
      { combo: "1-2-3", desc: "קלאסית יציבה" },
      { combo: "1-7-3", desc: "אפרקט-הוק מסיים" },
      { combo: "2-4-7-2-4", desc: "פירוק הגנות אחרון" },
      { combo: "1 ▲ 1-2-7-2", desc: "תנועה ועוצמה משולבים" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: ספרינט כוח מוחלט" }
    ]
  },
  MAYWEATHER: {
    name: "Floyd Mayweather",
    roundFocus: [
      "חימום: ישרים ותנועה",
      "מהירות ותנועה היקפית",
      "קומבינציות ארוכות ומטעות",
      "הגנה חכמה והתקפות נגד",
      "שליטה בקצב הזירה",
      "נפח ועייפות מנטלית",
      "הגנה מוחלטת ויציאה קדימה"
    ],
    plan: [
      { combo: "1", desc: "ג'אב מהיר (Flicker)" },
      { combo: "2", desc: "קרוס מהיר לטווח ארוך" },
      { combo: "1-2", desc: "שילוב ישרים בסיסי" },
      { combo: "1 ► 2-4", desc: "תנועה הצידה ויציאה ברצף" },
      { combo: "1 ◄ 1-2", desc: "צעד שמאל, ג'אב כפול וקרוס" },
      { combo: "1-1-2", desc: "ג'אב כפול, קרוס ישיר" },
      { combo: "1 ► 2-2", desc: "צעד ימין, קרוס כפול" },
      { combo: "1-2 ► 4", desc: "ג'אב-קרוס, צעד ימין, הוק חטוף" },
      { combo: "1-2-3", desc: "שלשה מהירה" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד ימין, ג'אב-הוק" },
      { combo: "1-2-1-2-1-2", desc: "שש מכות ישרות (נפח)" },
      { combo: "1-2-3-7-2", desc: "קומבינציה ארוכה ומסיימת" },
      { combo: "1 ◄ 1-2", desc: "תנועה מתמדת שמאלה" },
      { combo: "1-2-7-3", desc: "ישרים, אפרקט, הוק מהיר" },
      { combo: "2-4-7-4", desc: "מענה מהיר מיד אחורית" },
      { combo: "1 ▲ 1", desc: "ג'אב, התחמקות, ג'אב חוזר" },
      { combo: "1-2 ▲ 3", desc: "ישרים, משיכה (Pull), הוק" },
      { combo: "2-4-7-2-4", desc: "רצף קל להצפת היריב" },
      { combo: "1 ► 2-4", desc: "יציאה מהקו, קרוס, הוק" },
      { combo: "1-1-2", desc: "ג'אב כפול וקרוס" },
      { combo: "1-3-7-3", desc: "קומבינציה משתנה" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד הצידה, ג'אב-הוק" },
      { combo: "1-2-7-4-2", desc: "רצף לחיתוך זוויות" },
      { combo: "1 ▲ 1-2-7-2", desc: "תנועת ראש מרובה בהתקפה" },
      { combo: "3-4-3-4-3-4", desc: "רצף קל לגוף ולראש" },
      { combo: "1-2-1-2-1-2", desc: "ידיים עסוקות ללא הפסקה" },
      { combo: "1-2 ► 4", desc: "ג'אב קרוס ויציאה מזווית" },
      { combo: "1-2-3-7-2", desc: "החלפת הילוכים לרצף ארוך" },
      { combo: "1 ◄ 1-2", desc: "הגנה דרך רגליים" },
      { combo: "2-4", desc: "קרוס-הוק חטופים" },
      { combo: "1 ▲ 1", desc: "ניהול מרחק אקטיבי" },
      { combo: "1-2-7-2", desc: "ארבע מכות ישרות למרכז" },
      { combo: "2-4-7-2-4", desc: "שבירת קצב אחרונה" },
      { combo: "1 ► 2-4", desc: "צעד אחרון מחוץ לטווח" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: ספרינט מהירות" }
    ]
  },
  ALI: {
    name: "Muhammad Ali",
    roundFocus: [
      "חימום: ישרים וניהול טווח",
      "ריקוד זירה ותנועה (Ali Shuffle)",
      "שינוי קצב וג'אב מציק",
      "לחימה בנסיגה (Backfoot)",
      "התקפות מתפרצות ומהירות",
      "לחץ בסיבובים מאוחרים",
      "סיבוב אליפות ומאמץ מנטלי"
    ],
    plan: [
      { combo: "1", desc: "ג'אב מהיר (Flicker)" },
      { combo: "2", desc: "קרוס ישיר ארוך" },
      { combo: "1-2", desc: "שילוב ישרים בסיסי" },
      { combo: "1-1-2", desc: "ג'אב כפול וקרוס" },
      { combo: "1 ▲ 1", desc: "ג'אב, הטיית ראש, ג'אב" },
      { combo: "1 ◄ 1-2", desc: "צעד שמאל, ג'אב-קרוס מהיר" },
      { combo: "1 ► 2-2", desc: "צעד ימין, קרוס כפול" },
      { combo: "1-2-1-2", desc: "ארבע מכות ישרות מהמקום" },
      { combo: "1-2 ► 4", desc: "ישרים, צעד ימין, הוק חטוף" },
      { combo: "3-4-3-4", desc: "רצף הוקים מהיר לראש" },
      { combo: "1-1-1", desc: "ג'אב משולש להסחת דעת" },
      { combo: "1-2-3", desc: "שלשה קלאסית חלקה" },
      { combo: "2-4-7-4", desc: "מכות כוח מטווח ארוך" },
      { combo: "1 ▲ 1-2-7-2", desc: "הטיית גוף וקומבינציה זורמת" },
      { combo: "1-2-1-2-1-2", desc: "ספרינט ישרים (נפח גבוה)" },
      { combo: "1 ▲ 1", desc: "משיכת ראש לאחור וצעד אחורה" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד הצידה, ג'אב-הוק" },
      { combo: "1-2-7-3", desc: "ישרים, אפרקט מפתיע, הוק" },
      { combo: "1 ◄ 1-2", desc: "תנועה שמאל לשבירת קו" },
      { combo: "1-3-7-3", desc: "שילוב ידיים מהיר" },
      { combo: "1-2-1-2-1-2", desc: "מטר מכות מהירות לפנים" },
      { combo: "2-4", desc: "קרוס והוק מהיר ויציאה" },
      { combo: "1-2-3-7-2", desc: "מרחוק לקרוב ברצף שלם" },
      { combo: "1 ► 2-4", desc: "צעד ימין, קרוס, הוק" },
      { combo: "3-4-3-4-3-4", desc: "התפוצצות הוקים קצרים" },
      { combo: "1-1-2", desc: "חזרה לבסיס: ג'אב כפול וקרוס" },
      { combo: "1-2-7-4-2", desc: "רצף ארוך ליצירת לחץ" },
      { combo: "1 ▲ 3", desc: "ג'אב, חמיקה, הוק מהיר" },
      { combo: "2-4-7-2-4", desc: "חילופי מהלכים מהירים" },
      { combo: "1 ◄ 1-2", desc: "יציאה מהירה מטווח יריב" },
      { combo: "1-1-1", desc: "ג'אב לשמירת מרחק" },
      { combo: "1-2-3", desc: "קומבינציה נקייה וחדה" },
      { combo: "1-2-7-2", desc: "ארבע מכות מהירות למרכז" },
      { combo: "1 ► 2-4", desc: "צעד הצידה ומכות נגד" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: ספרינט ישרים מוחלט" }
    ]
  }
};

// --- STATE MANAGEMENT ---
const runtimeEngineState = {
  configuredRoundsCount: 7,
  activeSessionSeconds: 0,
  activePhaseSeconds: 0,
  currentPhase: 'SETUP',
  activeRoundIndex: 1
};

const appState = {
  settings: {
    intensity: 'TYSON',
    targetRounds: 7,
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

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateMuteIcon();
    const initialIntensity = appState.settings.intensity;
    app.selectDiff(initialIntensity);
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered', reg))
            .catch(err => console.log('SW Failed', err));
    }

    document.getElementById('muteBtn').onclick = toggleMute;
    document.getElementById('btn-start-fight').onclick = startWorkout;
    document.getElementById('pauseBtn').onclick = togglePause;
    document.getElementById('stopBtn').onclick = endWorkout;
    document.getElementById('btn-restart').onclick = resetApp;
    document.getElementById('btn-minus').onclick = () => changeRounds(-1);
    document.getElementById('btn-plus').onclick = () => changeRounds(1);
});

const app = {
    selectDiff: (lvl) => {
        const validKeys = ['TYSON', 'MAYWEATHER', 'ALI'];
        const sanitizedLvl = validKeys.includes(lvl) ? lvl : 'TYSON';

        appState.settings.intensity = sanitizedLvl;

        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('btn-' + sanitizedLvl.toLowerCase());
        if(btn) btn.classList.add('active');
        
        const setupRoundCountEl = document.getElementById('setupRoundCount');
        if (setupRoundCountEl) setupRoundCountEl.innerText = appState.settings.targetRounds;

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
    return 120 + (appState.settings.targetRounds * 300) + ((appState.settings.targetRounds - 1) * 30);
}

async function startWorkout() {
    await initializeAudioEngine();

    runtimeEngineState.currentPhase = 'WARMUP';
    runtimeEngineState.activePhaseSeconds = 120;
    runtimeEngineState.activeRoundIndex = 1;
    runtimeEngineState.activeSessionSeconds = calculateTotalTime();

    appState.engine.phase = 'warmup';
    appState.engine.currentRound = 1;
    appState.engine.elapsedPhaseSeconds = 120;
    appState.engine.workSecondsGlobal = 0;
    appState.engine.elapsedTotalSeconds = runtimeEngineState.activeSessionSeconds;
    
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

    runtimeEngineState.activePhaseSeconds--;
    runtimeEngineState.activeSessionSeconds--;
    
    appState.engine.elapsedPhaseSeconds = runtimeEngineState.activePhaseSeconds;
    appState.engine.elapsedTotalSeconds = runtimeEngineState.activeSessionSeconds;

    if (runtimeEngineState.currentPhase === 'WORK') {
        appState.engine.workSecondsGlobal++;

        if (runtimeEngineState.activePhaseSeconds > 0 && runtimeEngineState.activePhaseSeconds % 60 === 0) {
            playSound('minute');
        }
    }

    if (runtimeEngineState.activePhaseSeconds <= 0) {
        transitionWorkoutLifecyclePhase();
    }
    
    if (runtimeEngineState.activePhaseSeconds === 10) playSound('countdown');

    updateTimerUI();
}

function transitionWorkoutLifecyclePhase() {
    playSound('bell');

    if (runtimeEngineState.currentPhase === 'WARMUP') {
        runtimeEngineState.currentPhase = 'WORK';
        runtimeEngineState.activePhaseSeconds = 300;
        runtimeEngineState.activeRoundIndex = 1;
    } else if (runtimeEngineState.currentPhase === 'WORK') {
        if (runtimeEngineState.activeRoundIndex >= appState.settings.targetRounds) {
            finishSession();
            return;
        }
        runtimeEngineState.currentPhase = 'REST';
        runtimeEngineState.activePhaseSeconds = 30;
    } else if (runtimeEngineState.currentPhase === 'REST') {
        runtimeEngineState.currentPhase = 'WORK';
        runtimeEngineState.activePhaseSeconds = 300;
        runtimeEngineState.activeRoundIndex++;
    }

    appState.engine.phase = runtimeEngineState.currentPhase.toLowerCase();
    appState.engine.currentRound = runtimeEngineState.activeRoundIndex;
    appState.engine.elapsedPhaseSeconds = runtimeEngineState.activePhaseSeconds;
}

function updateTimerUI() {
    const mainTimer = document.getElementById('mainTimer');
    const totalTimer = document.getElementById('totalTimer');
    if (mainTimer) mainTimer.innerText = formatTime(runtimeEngineState.activePhaseSeconds);
    if (totalTimer) totalTimer.innerText = formatTime(runtimeEngineState.activeSessionSeconds);
    
    const status = document.getElementById('statusText');
    const currentPatternEl = document.getElementById('currentPattern');
    const nextPatternEl = document.getElementById('nextPattern');
    const body = document.body;

    if (runtimeEngineState.currentPhase === 'WORK') {
        body.classList.remove('rest-mode');
        if (status) status.innerText = 'ROUND ' + runtimeEngineState.activeRoundIndex;
        
        const routine = FIGHTER_ROUTINES[appState.settings.intensity].plan;
        const routineLength = routine.length;
        
        let relativeMinuteIndex = Math.floor((300 - runtimeEngineState.activePhaseSeconds) / 60);
        if (relativeMinuteIndex < 0) relativeMinuteIndex = 0;
        if (relativeMinuteIndex >= 5) relativeMinuteIndex = 4;
        let finalTargetIndex = ((runtimeEngineState.activeRoundIndex - 1) * 5) + relativeMinuteIndex;

        const currentCombo = routine[finalTargetIndex % routineLength].combo;
        const nextCombo = routine[(finalTargetIndex + 1) % routineLength].combo;

        if (currentPatternEl) {
            currentPatternEl.innerHTML = renderStructuredComboHTML(currentCombo, routine[finalTargetIndex % routineLength].desc);
        }
        if (nextPatternEl) nextPatternEl.innerHTML = parseIcons(nextCombo);
        
    } else {
        body.classList.add('rest-mode');
        
        if (runtimeEngineState.currentPhase === 'WARMUP') {
            if (status) status.innerText = "WARM UP";
            if (currentPatternEl) currentPatternEl.innerHTML = `<div class="text-6xl font-bold tracking-wider text-[var(--theme-accent)]">BREATHE</div>`;
            if (nextPatternEl) nextPatternEl.innerText = "GET READY";
        } else if (runtimeEngineState.currentPhase === 'REST') {
            if (status) status.innerText = "REST";
            if (currentPatternEl) currentPatternEl.innerHTML = `<div class="text-6xl font-bold tracking-wider text-[var(--theme-accent)]">BREATHE</div>`;

            const roundFocusArr = FIGHTER_ROUTINES[appState.settings.intensity].roundFocus;
            const focusText = `סיבוב ${runtimeEngineState.activeRoundIndex + 1}: ${roundFocusArr[runtimeEngineState.activeRoundIndex % roundFocusArr.length]}`;
            if (nextPatternEl) nextPatternEl.innerText = focusText;
        }
    }
}

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

function parseIcons(text) {
    if(!text) return '';
    return text.replace(/▲/g,'<span class="material-symbols-outlined text-xl">keyboard_double_arrow_up</span>')
                .replace(/▼/g,'<span class="material-symbols-outlined text-xl">keyboard_double_arrow_down</span>')
                .replace(/◄/g,'<span class="material-symbols-outlined text-xl">keyboard_double_arrow_left</span>')
                .replace(/►/g,'<span class="material-symbols-outlined text-xl">keyboard_double_arrow_right</span>');
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

// פונקציית הרינדור עודכנה לתצוגה ענקית (text-7xl למספרים, text-3xl לטקסט) ללא גלישת שורות
function renderStructuredComboHTML(comboString, descriptorText) {
    if (!comboString) return '';
    const safeDescriptor = descriptorText || '';
    const elements = comboString.split(/(\s+|-|▲|▼|►|◄)/);
    let parsedHTML = '<div class="flex items-center justify-center gap-6 flex-wrap-none">';

    elements.forEach(item => {
        const trimmed = item.trim();
        if (!trimmed) return;
        if (["▲", "▼", "►", "◄"].includes(trimmed)) {
            let iconName = "keyboard_double_arrow_right";
            if (trimmed === "▲") iconName = "keyboard_double_arrow_up";
            if (trimmed === "▼") iconName = "keyboard_double_arrow_down";
            if (trimmed === "◄") iconName = "keyboard_double_arrow_left";
            parsedHTML += `<span class="material-symbols-outlined text-[var(--theme-accent)] text-5xl">${iconName}</span>`;
        } else if (trimmed === "-") {
            parsedHTML += `<span class="text-gray-600 text-5xl font-bold mx-1">-</span>`;
        } else if (/^\d+$/.test(trimmed)) {
            parsedHTML += `
                <div class="flex flex-col items-center bg-[var(--surface-glass)] px-6 py-3 rounded-lg min-w-[90px]">
                    <span class="font-['Teko'] text-7xl text-white font-bold leading-none">${trimmed}</span>
                </div>`;
        }
    });

    parsedHTML += `</div><p class="font-['Assistant'] text-gray-300 text-center mt-6 text-3xl tracking-wide font-bold">${safeDescriptor}</p>`;
    return parsedHTML;
}