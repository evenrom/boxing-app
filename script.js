// --- CONFIGURATION ---
// החלף את השורה למטה בכתובת ה-URL שקיבלת מגוגל סקריפט
const API_URL = "INSERT_YOUR_GOOGLE_SCRIPT_URL_HERE";

// --- AUDIO ASSETS ---
const SOUNDS = {
    bell: new Audio('https://github.com/evenrom/boxing-timer-assets/raw/refs/heads/main/bell.mp3'),
    minute: new Audio('https://github.com/evenrom/boxing-timer-assets/raw/refs/heads/main/minute.mp3'),
    countdown: new Audio('https://github.com/evenrom/boxing-timer-assets/raw/refs/heads/main/countdown.mp3')
};

// --- DIFFICULTY SETTINGS ---
const CONFIG = {
    'ROOKIE': { round: 180, rest: 20 },
    'PRO':    { round: 300, rest: 30 },
    'CHAMP':  { round: 600, rest: 60 }
};

// --- COMBOS ---
const COMBOS = {
    fixed: ["1", "1-2", "1-2-3"], 
    pool: [
        "1 ▲ 1", "1-2-7-2", "2-4", "1-1-2", "1-4 ► 2", "1-2-3",
        "1-2-7-3", "1 ◄ 1-2", "1-3-7-3", "2-4 ◄ 4", "1-2-7-2",
        "1-2 ▲ 3", "1-2-7-4-2", "2 ▲ 4-4", "1 ▲ 3-3", "1-3-7-4",
        "2-4-7-3", "1 ► 2-2", "1-2-1-2", "3-4-3-4", "1 ► 2-4"
    ]
};

// --- STATE MANAGEMENT ---
let state = {
    level: 'ROOKIE',
    targetRounds: 8,
    isMuted: localStorage.getItem('boxingMuted') === 'true',
    userId: localStorage.getItem('boxingUserId'),
    phase: 'setup',
    timeLeft: 0,
    totalTime: 0,
    currentRound: 0,
    workSeconds: 0,
    // משתנה חדש: תור האימון
    workoutQueue: [], 
    timer: null,
    wakeLock: null
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (!state.userId) {
        state.userId = crypto.randomUUID();
        localStorage.setItem('boxingUserId', state.userId);
    }

    if (API_URL && API_URL.includes('script.google.com')) {
        fetchStats();
    }

    updateMuteIcon();
    app.selectDiff('ROOKIE');
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }

    document.getElementById('muteBtn').onclick = toggleMute;
    document.getElementById('btn-start-fight').onclick = startWorkout;
    document.getElementById('pauseBtn').onclick = togglePause;
    document.getElementById('stopBtn').onclick = endWorkout;
    document.getElementById('btn-restart').onclick = resetApp;
    document.getElementById('btn-minus').onclick = () => changeRounds(-1);
    document.getElementById('btn-plus').onclick = () => changeRounds(1);
});

// --- APP LOGIC ---

const app = {
    selectDiff: (lvl) => {
        state.level = lvl;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`btn-${lvl.toLowerCase()}`).classList.add('active');
        updateTotalTimePreview();
    }
};

function changeRounds(delta) {
    state.targetRounds = Math.max(1, state.targetRounds + delta);
    document.getElementById('setupRoundCount').innerText = state.targetRounds;
    updateTotalTimePreview();
}

function updateTotalTimePreview() {
    const total = calculateTotalTime();
    document.getElementById('totalTimePreview').innerText = formatTime(total);
}

function calculateTotalTime() {
    const cfg = CONFIG[state.level];
    return 60 + (state.targetRounds * cfg.round) + ((state.targetRounds - 1) * cfg.rest);
}

// --- WORKOUT ENGINE ---

function startWorkout() {
    state.phase = 'warmup';
    state.currentRound = 0;
    state.timeLeft = 60;
    state.workSeconds = 0;
    state.totalTime = calculateTotalTime();
    
    // יצירת פלייליסט לכל האימון מראש
    generateWorkoutQueue();

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('timer-screen').style.display = 'flex';
    
    requestWakeLock();
    playSound('bell');
    
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(tick, 1000);
    updateTimerUI();
}

// פונקציה חדשה: בניית תור האימון מראש
function generateWorkoutQueue() {
    state.workoutQueue = [];
    const cfg = CONFIG[state.level];
    // סה"כ שניות עבודה נטו באימון
    const totalWorkSeconds = state.targetRounds * cfg.round;
    
    // חישוב כמה "סלוטים" של תרגילים אנחנו צריכים
    // שלב א' (180 שניות) מתחלף כל 20 שניות = 9 סלוטים
    // שלב ב' (השאר) מתחלף כל 15 שניות
    
    // 1. מילוי 3 דקות ראשונות (קבוע)
    for (let i = 0; i < 9; i++) {
        state.workoutQueue.push(COMBOS.fixed[i % 3]);
    }
    
    // 2. מילוי שאר הזמן (רנדומלי - Deck of Cards)
    let remainingTime = totalWorkSeconds - 180;
    if (remainingTime > 0) {
        let slotsNeeded = Math.ceil(remainingTime / 15) + 5; // +5 ליתר ביטחון
        let tempDeck = [];
        
        for (let i = 0; i < slotsNeeded; i++) {
            if (tempDeck.length === 0) {
                tempDeck = [...COMBOS.pool].sort(() => Math.random() - 0.5);
            }
            state.workoutQueue.push(tempDeck.pop());
        }
    }
}

function getIndexFromTime(seconds) {
    if (seconds < 180) {
        return Math.floor(seconds / 20);
    } else {
        // אחרי 3 דקות, מתחילים ב-15 שניות, החל מאינדקס 9
        return 9 + Math.floor((seconds - 180) / 15);
    }
}

function tick() {
    if (document.getElementById('pauseBtn').innerText === "RESUME") return;

    state.timeLeft--;
    state.totalTime--;
    
    if (state.phase === 'work') {
        state.workSeconds++;
        if (state.timeLeft > 0 && state.timeLeft % 60 === 0) playSound('minute');
    }

    if (state.timeLeft <= 0) {
        handlePhaseChange();
    }
    
    if (state.timeLeft === 10) playSound('countdown');

    updateTimerUI();
}

function handlePhaseChange() {
    playSound('bell');
    const cfg = CONFIG[state.level];

    if (state.phase === 'warmup') {
        state.phase = 'work';
        state.currentRound = 1;
        state.timeLeft = cfg.round;

    } else if (state.phase === 'work') {
        if (state.currentRound >= state.targetRounds) {
            finishSession();
            return;
        }
        state.phase = 'rest';
        state.timeLeft = cfg.rest;

    } else if (state.phase === 'rest') {
        state.phase = 'work';
        state.currentRound++;
        state.timeLeft = cfg.round;
    }
}

// --- UI UPDATE ---
function updateTimerUI() {
    document.getElementById('mainTimer').innerText = formatTime(state.timeLeft);
    document.getElementById('totalTimer').innerText = formatTime(state.totalTime);
    
    const status = document.getElementById('statusText');
    const body = document.body;

    if (state.phase === 'work') {
        body.classList.remove('rest-mode');
        status.innerText = `ROUND ${state.currentRound}`;
        
        // שליפה מהתור המוכן מראש
        const currentIndex = getIndexFromTime(state.workSeconds);
        const currentCombo = state.workoutQueue[currentIndex] || "FREESTYLE";
        const nextCombo = state.workoutQueue[currentIndex + 1] || "...";

        document.getElementById('currentPattern').innerHTML = parseIcons(currentCombo);
        
        // עכשיו אנחנו יכולים לראות את הבא בתור!
        document.getElementById('nextPattern').innerHTML = parseIcons(nextCombo);
        
    } else {
        body.classList.add('rest-mode');
        status.innerText = state.phase === 'warmup' ? "WARM UP" : "REST";
        document.getElementById('currentPattern').innerText = "BREATHE";
        
        if (state.phase === 'rest') {
            document.getElementById('nextPattern').innerText = `NEXT: ROUND ${state.currentRound + 1}`;
        } else {
            document.getElementById('nextPattern').innerText = "GET READY";
        }
    }
}

// --- DATA & SYNC ---

function finishSession() {
    clearInterval(state.timer);
    if (state.wakeLock) state.wakeLock.release();

    const totalDurationMin = Math.round(state.workSeconds / 60); 
    if (totalDurationMin >= 1) { 
        logWorkout(totalDurationMin);
    }

    document.getElementById('timer-screen').style.display = 'none';
    document.getElementById('finish-screen').style.display = 'flex';
    document.getElementById('finishRoundsVal').innerText = state.targetRounds;
}

function logWorkout(mins) {
    if (!API_URL.includes('http')) return;
    const url = `${API_URL}?action=logWorkout&userId=${state.userId}&difficulty=${state.level}&rounds=${state.targetRounds}&duration=${mins}`;
    fetch(url, { mode: 'no-cors' }).catch(e => console.log('Save failed', e));
}

function fetchStats() {
    if (!API_URL.includes('http')) return;
    const url = `${API_URL}?action=getStats&userId=${state.userId}`;
    fetch(url)
        .then(r => r.json())
        .then(data => {
            if(data.status === 'error') return;
            document.getElementById('stat-weekly').innerText = data.workoutsPerWeek || 0;
            document.getElementById('stat-duration').innerText = data.avgDuration || 0;
            document.getElementById('stat-level').innerText = data.avgLevel || '-';
        })
        .catch(e => console.log('Offline'));
}

// --- HELPERS ---

function toggleMute() {
    state.isMuted = !state.isMuted;
    localStorage.setItem('boxingMuted', state.isMuted);
    updateMuteIcon();
}

function updateMuteIcon() {
    const icon = document.querySelector('#muteBtn span');
    icon.innerText = state.isMuted ? 'volume_off' : 'volume_up';
    icon.style.opacity = state.isMuted ? '0.5' : '1';
}

function playSound(name) {
    if (!state.isMuted && SOUNDS[name]) {
        SOUNDS[name].currentTime = 0;
        SOUNDS[name].play().catch(e => {});
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
        try { state.wakeLock = await navigator.wakeLock.request('screen'); } catch(e){}
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
