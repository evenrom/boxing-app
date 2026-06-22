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
const FIGHTER_ROUTINES = {
  TYSON: {
    name: "Mike Tyson",
    roundFocus: [
      "חימום מובנה לשמירת טווח ומציאת מרחק",
      "כניסה לטווח ושינוי גובה",
      "דגש אפרקטים (Peek-a-boo Style)",
      "לחץ והתחמקות מתוזמנת",
      "עבודה גוף-ראש ועוצמה מתפרצת",
      "שיא העומס (Volume Power)",
      "סיבוב אליפות (עייפות קיצונית וכוח רצון)"
    ],
    plan: [
      { combo: "1", desc: "ג'אב בלבד לשמירת טווח" },
      { combo: "2", desc: "קרוס בלבד למציאת מרחק" },
      { combo: "1-2", desc: "שילוב בסיסי" },
      { combo: "1 ▲ 1", desc: "ג'אב, ירידה להגנה, ג'אב" },
      { combo: "1-2-7-2", desc: "סגירת החימום עם כניסה ראשונה" },
      { combo: "1 ▲ 3", desc: "ג'אב, ירידה (Slip), הוק שמאלי חזק" },
      { combo: "2-4", desc: "קרוס, הוק ימני עוצמתי" },
      { combo: "1 ◄ 1-2", desc: "צעד שמאלה, ג'אב-קרוס מהיר" },
      { combo: "1-2 ▲ 3", desc: "ג'אב-קרוס, ירידה, הוק שמאלי לגוף/ראש" },
      { combo: "3-4-3-4", desc: "רצף הוקים קרוב ומהיר" },
      { combo: "1-7-3", desc: "ג'אב, אפרקט ימני, הוק שמאלי (קלאסי טייסון)" },
      { combo: "2-7-4", desc: "קרוס, אפרקט שמאלי, הוק ימני" },
      { combo: "1 ▲ 1-2-7-2", desc: "ג'אב, ירידה, ג'אב-קרוס-אפרקט-קרוס" },
      { combo: "1-2-7-4-2", desc: "קומבינציית כוח מתגלגלת" },
      { combo: "3-4-3-4-3-4", desc: "התפוצצות בטווח אפס" },
      { combo: "1 ► 2-2", desc: "צעד ימינה, קרוס כפול" },
      { combo: "1 ▲ 3-3", desc: "ג'אב, ירידה, הוק שמאלי כפול (גוף-ראש)" },
      { combo: "2 ▲ 4-4", desc: "קרוס, ירידה, הוק ימני כפול" },
      { combo: "1-2-7-3", desc: "ג'אב-קרוס, אפרקט, הוק מסיים" },
      { combo: "1-3-7-3", desc: "רצף כוח שמאלי-ימני לסירוגין" },
      { combo: "2-4-7-2-4", desc: "רצף כוח ארוך להרס הגנות" },
      { combo: "1 ▲ 1", desc: "הטעיה למטה, כניסה WITH ג'אב" },
      { combo: "1-2-3-7-2", desc: "קומבינציה שלמה מטווח בינוני לקרוב" },
      { combo: "1-2-7-2", desc: "פיניש מהיר" },
      { combo: "3-4-3-4", desc: "רצף כוח מתיש" },
      { combo: "1-2-1-2-1-2", desc: "מטר ג'אב-קרוס רציף להסחת דעת" },
      { combo: "1-2-7-4-2", desc: "מעבר מיידי למכות כוח" },
      { combo: "1-3-7-3", desc: "לחץ מתמיד" },
      { combo: "2-4-7-4", desc: "סיומת חזקה עם הוק ימני" },
      { combo: "1 ▲ 3-3", desc: "כניסה מתחת למכות של היריב" },
      { combo: "1-2-3", desc: "קומבינציה קלאסית ויציבה" },
      { combo: "1-7-3", desc: "כניסה אחרונה לאפרקט-הוק" },
      { combo: "2-4-7-2-4", desc: "פירוק הגנות אחרון" },
      { combo: "1 ▲ 1-2-7-2", desc: "תנועה ועוצמה משולבים" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: התפוצצות מהירות וכוח עד הבאזר" }
    ]
  },
  MAYWEATHER: {
    name: "Floyd Mayweather",
    roundFocus: [
      "חימום מובנה - שילוב ישרים ותנועה בסיסית",
      "מהירות ותנועה היקפית",
      "קומבינציות ארוכות ומטעות",
      "הגנה חכמה והתקפות נגד (Counter-Punching)",
      "שליטה בקצב (Ring Generalship)",
      "נפח ועייפות מנטלית",
      "סיבוב הגנה מוחלטת ויציאה קדימה"
    ],
    plan: [
      { combo: "1", desc: "ג'אב בודד מהיר (Flicker Jab)" },
      { combo: "2", desc: "קרוס מהיר לטווח ארוך" },
      { combo: "1-2", desc: "שילוב ישרים בסיסי" },
      { combo: "1 ► 2-4", desc: "תנועה הצידה ויציאה עם קומבינציה" },
      { combo: "1 ◄ 1-2", desc: "צעד שמאלה עם ג'אב כפול וקרוס" },
      { combo: "1-1-2", desc: "ג'אב כפול מהיר, קרוס ישיר" },
      { combo: "1 ► 2-2", desc: "צעד ימינה, קרוס מהיר כפול לטווח" },
      { combo: "1-2 ► 4", desc: "ג'אב-קרוס, צעד ימינה, הוק חטוף" },
      { combo: "1-2-3", desc: "שלשה קלאסית ומהירה" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד ימינה, ג'אב-הוק מהיר" },
      { combo: "1-2-1-2-1-2", desc: "שש מכות ישרות ומהירות (עבודת נפח)" },
      { combo: "1-2-3-7-2", desc: "קומבינציה ארוכה: ישרים, הוק, אפרקט, קרוס מסיים" },
      { combo: "1 ◄ 1-2", desc: "תנועת רגליים מתמדת שמאלה" },
      { combo: "1-2-7-3", desc: "ישרים, אפרקט מהיר, הוק מציק" },
      { combo: "2-4-7-4", desc: "מענה מהיר מהיד האחורית" },
      { combo: "1 ▲ 1", desc: "ג'אב, התחמקות לאחור/למטה, ג'אב חוזר" },
      { combo: "1-2 ▲ 3", desc: "ישרים, משיכת גוף לאחור (Pull), הוק שמאלי מהיר" },
      { combo: "2-4-7-2-4", desc: "רצף מכות קלות ומהירות להצפת היריב" },
      { combo: "1 ► 2-4", desc: "יציאה מהקו, קרוס, הוק ימני" },
      { combo: "1-1-2", desc: "חזרה לג'אב כפול וקרוס" },
      { combo: "1-3-7-3", desc: "קומבינציה משתנה: ג'אב, הוק, אפרקט, הוק" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד הצידה, יציאה WITH ג'אב-הוק" },
      { combo: "1-2-7-4-2", desc: "קומבינציה ארוכה ומורכבת לחיתוך זוויות" },
      { combo: "1 ▲ 1-2-7-2", desc: "תנועת ראש מרובה תוך כדי התקפה" },
      { combo: "3-4-3-4-3-4", desc: "רצף מכות קלות ומהירות לגוף ולראש" },
      { combo: "1-2-1-2-1-2", desc: "שמירה על ידיים עסוקות ללא הפסקה" },
      { combo: "1-2 ► 4", desc: "ג'אב קרוס ויציאה מהזווית של היריב" },
      { combo: "1-2-3-7-2", desc: "החלפת הילוכים לקומבינציה ארוכה" },
      { combo: "1 ◄ 1-2", desc: "הגנה דרך תנועת רגליים" },
      { combo: "2-4", desc: "קרוס-הוק חטופים ומהירים" },
      { combo: "1 ▲ 1", desc: "ניהול מרחק פסיבי-אקטיבי" },
      { combo: "1-2-7-2", desc: "ארבע מכות ישרות ומהירות למרכז" },
      { combo: "2-4-7-2-4", desc: "שבירת קצב אחרונה" },
      { combo: "1 ► 2-4", desc: "צעד אחרון החוצה מהטווח" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: ספרינט מהירות מוחלט וקל עד הבאזר" }
    ]
  },
  ALI: {
    name: "Muhammad Ali",
    roundFocus: [
      "חימום מובנה - עבודת ישרים וניהול טווח ארוך",
      "ריקוד זירה ותנועה היקפית (The Ali Shuffle)",
      "שינוי קצב וג'אב מציק (The Flicker Jab)",
      "לחימה בנסיגה (Fighting on the Backfoot)",
      "התקפות מתפרצות (Showboating & Speed)",
      "לחץ בסיבובים המאוחרים",
      "סיבוב אליפות (עייפות ומהירות מנטלית)"
    ],
    plan: [
      { combo: "1", desc: "ג'אב בודד מהיר (Flicker)" },
      { combo: "2", desc: "קרוס ישיר ארוך" },
      { combo: "1-2", desc: "שילוב ישרים בסיסי" },
      { combo: "1-1-2", desc: "ג'אב כפול וקרוס" },
      { combo: "1 ▲ 1", desc: "ג'אב, הטיית ראש לאחור, ג'אב חוזר" },
      { combo: "1 ◄ 1-2", desc: "ג'אב, צעד שמאלה, ג'אב-קרוס מהיר" },
      { combo: "1 ► 2-2", desc: "ג'אב, צעד ימינה, קרוס כפול לטווח" },
      { combo: "1-2-1-2", desc: "ארבע מכות ישרות ומהירות מהמקום" },
      { combo: "1-2 ► 4", desc: "ישרים, צעד ימינה ויציאה עם הוק חטוף" },
      { combo: "3-4-3-4", desc: "רצף הוקים מהיר בגובה הראש" },
      { combo: "1-1-1", desc: "ג'אב משולש מהיר להסחת דעת ומרחק" },
      { combo: "1-2-3", desc: "שלשה קלאסית וחלקה" },
      { combo: "2-4-7-4", desc: "מעבר מהיר למכות כוח מטווח ארוך" },
      { combo: "1 ▲ 1-2-7-2", desc: "ג'אב, הטיית גוף, קומבינציה זורמת" },
      { combo: "1-2-1-2-1-2", desc: "ספרינט מכות ישרות (נפח גבוה)" },
      { combo: "1 ▲ 1", desc: "משיכת הראש לאחור (Lean back) וג'אב תוך כדי צעד אחורה" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד הצידה, ג'אב-הוק מהיר" },
      { combo: "1-2-7-3", desc: "ישרים, אפרקט מפתיע, הוק מסיים" },
      { combo: "1 ◄ 1-2", desc: "תנועה שמאלה לשבירת קו ההתקפה" },
      { combo: "1-3-7-3", desc: "שילוב ידיים מהיר ומורכב" },
      { combo: "1-2-1-2-1-2", desc: "מטר מכות מהירות לפנים" },
      { combo: "2-4", desc: "קרוס והוק מהיר ויציאה החוצה" },
      { combo: "1-2-3-7-2", desc: "קומבינציה שלמה שמתחילה מרחוק ומסתיימת קרוב" },
      { combo: "1 ► 2-4", desc: "צעד ימינה, קרוס, הוק ימני" },
      { combo: "3-4-3-4-3-4", desc: "התפוצצות הוקים קצרים" },
      { combo: "1-1-2", desc: "חזרה לבסיס: ג'אב כפול אגרסיבי וקרוס" },
      { combo: "1-2-7-4-2", desc: "רצף מכות ארוך שיוצר לחץ מנטלי" },
      { combo: "1 ▲ 3", desc: "ג'אב, חמיקה הצידה, הוק שמאלי מהיר" },
      { combo: "2-4-7-2-4", desc: "חילופי מהלכים מהירים" },
      { combo: "1 ◄ 1-2", desc: "יציאה מהירה מהטווח של היריב" },
      { combo: "1-1-1", desc: "שימוש בג'אב כדי להחזיק את המרחק" },
      { combo: "1-2-3", desc: "קומבינציה נקייה וחדה" },
      { combo: "1-2-7-2", desc: "ארבע מכות מהירות למרכז" },
      { combo: "1 ► 2-4", desc: "צעד אחרון הצידה ושילוב מכות נגד" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: ספרינט ישרים מוחלט עד הבאזר האחרון" }
    ]
  }
};

// --- DIFFICULTY SETTINGS (FIXED ROUNDS) ---

const CONFIG = {
    'ROOKIE': { round: 180, rest: 20, defaultRounds: 8 },
    'PRO':    { round: 300, rest: 30, defaultRounds: 6 },
    'CHAMP':  { round: 600, rest: 60, defaultRounds: 4 }
};

// --- STATE MANAGEMENT ---
const runtimeEngineState = {
  selectedFighterKey: 'TYSON',
  configuredRoundsCount: 7,
  activeSessionSeconds: 0,
  activePhaseSeconds: 0,
  currentPhase: 'SETUP',
  activeRoundIndex: 1
};

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
    return 120 + (appState.settings.targetRounds * cfg.round) + ((appState.settings.targetRounds - 1) * cfg.rest); // 120s for warmup
}

// --- WORKOUT ENGINE ---


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
    const cfg = CONFIG[appState.settings.intensity];

    if (runtimeEngineState.currentPhase === 'WARMUP') {
        runtimeEngineState.currentPhase = 'WORK';
        runtimeEngineState.activePhaseSeconds = cfg.round;
        runtimeEngineState.activeRoundIndex = 1;
    } else if (runtimeEngineState.currentPhase === 'WORK') {
        if (runtimeEngineState.activeRoundIndex >= appState.settings.targetRounds) {
            finishSession();
            return;
        }
        runtimeEngineState.currentPhase = 'REST';
        runtimeEngineState.activePhaseSeconds = cfg.rest;
    } else if (runtimeEngineState.currentPhase === 'REST') {
        runtimeEngineState.currentPhase = 'WORK';
        runtimeEngineState.activePhaseSeconds = cfg.round;
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
        
        const routine = FIGHTER_ROUTINES[runtimeEngineState.selectedFighterKey].plan;
        const routineLength = routine.length;
        
        let relativeMinuteIndex = Math.floor((300 - runtimeEngineState.activePhaseSeconds) / 60);
        if (relativeMinuteIndex < 0) relativeMinuteIndex = 0;
        let finalTargetIndex = ((runtimeEngineState.activeRoundIndex - 1) * 5) + relativeMinuteIndex;

        const currentCombo = routine[finalTargetIndex % routineLength].combo;
        const nextCombo = routine[(finalTargetIndex + 1) % routineLength].combo;

        if (currentPatternEl) currentPatternEl.innerHTML = parseIcons(currentCombo);
        if (nextPatternEl) nextPatternEl.innerHTML = parseIcons(nextCombo);
        
    } else {
        body.classList.add('rest-mode');
        
        if (runtimeEngineState.currentPhase === 'WARMUP') {
            if (status) status.innerText = "WARM UP";
            if (currentPatternEl) currentPatternEl.innerText = "BREATHE";
            if (nextPatternEl) nextPatternEl.innerText = "GET READY";
        } else if (runtimeEngineState.currentPhase === 'REST') {
            if (status) status.innerText = "REST";
            if (currentPatternEl) currentPatternEl.innerText = "BREATHE";

            const roundFocusArr = FIGHTER_ROUTINES[runtimeEngineState.selectedFighterKey].roundFocus;
            const focusText = `סיבוב ${runtimeEngineState.activeRoundIndex + 1}: ${roundFocusArr[runtimeEngineState.activeRoundIndex % roundFocusArr.length]}`;
            if (nextPatternEl) nextPatternEl.innerText = focusText;
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
