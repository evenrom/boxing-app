// --- CONFIGURATION ---
// החלף את השורה למטה בכתובת ה-URL שקיבלת מגוגל סקריפט
const API_URL = "https://script.google.com/macros/s/AKfycbynhdDZ9-8Ms-hNys8mxYRmUKd5NkkpcoV9zCHHwaTcAAFARRg_LGkBguKVaKPxXoQb/exec";

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

// --- COMBOS & PATTERNS ---
const COMBOS = {
    // שלב א': 3 דקות ראשונות קבועות
    fixed: ["1", "1-2", "1-2-3"], 
    // שלב ב': המאגר המלא (Deck of Cards)
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
    phase: 'setup', // setup, warmup, work, rest
    timeLeft: 0,
    totalTime: 0,
    currentRound: 0,
    workSeconds: 0, // סופר כמה זמן נטו עבדנו (לשינוי קומבינציות)
    deck: [],       // חפיסת הקלפים הנוכחית
    timer: null,
    wakeLock: null
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. יצירת/שליפת מזהה משתמש
    if (!state.userId) {
        state.userId = crypto.randomUUID();
        localStorage.setItem('boxingUserId', state.userId);
    }

    // 2. הבאת נתונים מהשרת
    if (API_URL && API_URL.includes('script.google.com')) {
        fetchStats();
    }

    // 3. אתחול ממשק
    updateMuteIcon();
    app.selectDiff('ROOKIE');
    
    // 4. רישום Service Worker (עבור PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }

    // 5. חיבור כפתורים
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
        // עדכון כפתורים
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
    // זמן = חימום (60) + (מספר סיבובים * זמן סיבוב) + (מספר מנוחות * זמן מנוחה)
    return 60 + (state.targetRounds * cfg.round) + ((state.targetRounds - 1) * cfg.rest);
}

// --- WORKOUT ENGINE ---

function startWorkout() {
    // אתחול משתנים לאימון חדש
    state.phase = 'warmup';
    state.currentRound = 0;
    state.timeLeft = 60; // דקה חימום
    state.workSeconds = 0;
    state.totalTime = calculateTotalTime();
    
    // הכנת חפיסת הקלפים (ערבוב ראשוני)
    state.deck = [...COMBOS.pool].sort(() => Math.random() - 0.5);

    // החלפת מסכים
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('timer-screen').style.display = 'flex';
    
    // מניעת כיבוי מסך
    requestWakeLock();
    
    playSound('bell');
    
    // התחלת הטיימר
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(tick, 1000);
    updateTimerUI();
}

function tick() {
    // אם מושהה - לא עושים כלום
    if (document.getElementById('pauseBtn').innerText === "RESUME") return;

    state.timeLeft--;
    state.totalTime--;
    
    if (state.phase === 'work') {
        state.workSeconds++;
        // צליל בכל דקה עגולה (למעט כשהזמן נגמר)
        if (state.timeLeft > 0 && state.timeLeft % 60 === 0) playSound('minute');
    }

    // בדיקה אם נגמר הזמן לשלב הנוכחי
    if (state.timeLeft <= 0) {
        handlePhaseChange();
    }
    
    // צליל ספירה לאחור (ב-10 שניות אחרונות)
    if (state.timeLeft === 10) playSound('countdown');

    updateTimerUI();
}

function handlePhaseChange() {
    playSound('bell');
    const cfg = CONFIG[state.level];

    if (state.phase === 'warmup') {
        // מעבר מחימום לסיבוב 1
        state.phase = 'work';
        state.currentRound = 1;
        state.timeLeft = cfg.round;

    } else if (state.phase === 'work') {
        // סיימנו סיבוב עבודה
        if (state.currentRound >= state.targetRounds) {
            finishSession();
            return;
        }
        // מעבר למנוחה
        state.phase = 'rest';
        state.timeLeft = cfg.rest;

    } else if (state.phase === 'rest') {
        // סיימנו מנוחה, מתחילים סיבוב חדש
        state.phase = 'work';
        state.currentRound++;
        state.timeLeft = cfg.round;
    }
}

// --- SMART COMBO LOGIC (Deck of Cards) ---
function getCurrentCombo() {
    // שלב א': 3 דקות ראשונות (180 שניות)
    if (state.workSeconds < 180) {
        // מחליף כל 20 שניות
        const idx = Math.floor((state.workSeconds % 60) / 20); 
        return COMBOS.fixed[idx % 3];
    }
    
    // שלב ב': רנדומלי חכם
    // מחליף כל 15 שניות
    const intervalIndex = Math.floor((state.workSeconds - 180) / 15);
    
    // אם נגמרה החפיסה - מערבבים מחדש
    if (state.deck.length === 0) {
        state.deck = [...COMBOS.pool].sort(() => Math.random() - 0.5);
    }
    
    // שליפת הקלף הבא (באמצעות מודולו על גודל החפיסה)
    const cardIndex = intervalIndex % state.deck.length;
    
    // זיהוי סיום סיבוב חפיסה לערבוב הבא
    if (cardIndex === 0 && intervalIndex > 0 && intervalIndex % state.deck.length === 0) {
         state.deck = [...COMBOS.pool].sort(() => Math.random() - 0.5);
    }
    
    return state.deck[cardIndex];
}

// --- UI UPDATE ---
function updateTimerUI() {
    document.getElementById('mainTimer').innerText = formatTime(state.timeLeft);
    document.getElementById('totalTimer').innerText = formatTime(state.totalTime);
    
    const status = document.getElementById('statusText');
    const body = document.body; // גישה ל-body לשינוי צבעים

    if (state.phase === 'work') {
        // מצב עבודה (כחול)
        body.classList.remove('rest-mode');
        
        status.innerText = `ROUND ${state.currentRound}`;
        
        // הצגת הקומבינציה
        const combo = parseIcons(getCurrentCombo());
        document.getElementById('currentPattern').innerHTML = combo;
        document.getElementById('nextPattern').innerText = "..."; // אופציונלי: אפשר להציג את הבא
        
    } else {
        // מצב מנוחה/חימום (ירוק)
        body.classList.add('rest-mode');
        
        status.innerText = state.phase === 'warmup' ? "WARM UP" : "REST";
        document.getElementById('currentPattern').innerText = "BREATHE";
        
        // הודעה לקראת הסיבוב הבא
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

    // בדיקה האם האימון היה מעל 10 דקות (בערך)
    const totalDurationMin = Math.round(state.workSeconds / 60); 
    
    // לוגיקה: אם עשינו לפחות 5 דקות עבודה נטו, נשמור (לצורך הטסטים שלך כרגע)
    // בפועל, בקוד הסופי אפשר לשנות ל-10
    if (totalDurationMin >= 1) { 
        logWorkout(totalDurationMin);
    }

    // מעבר למסך סיום
    document.getElementById('timer-screen').style.display = 'none';
    document.getElementById('finish-screen').style.display = 'flex';
    document.getElementById('finishRoundsVal').innerText = state.targetRounds;
}

function logWorkout(mins) {
    if (!API_URL.includes('http')) return;
    // שליחת נתונים ("Fire and Forget")
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
            // עדכון ה-UI עם הנתונים
            document.getElementById('stat-weekly').innerText = data.workoutsPerWeek || 0;
            document.getElementById('stat-duration').innerText = data.avgDuration || 0;
            document.getElementById('stat-level').innerText = data.avgLevel || '-';
        })
        .catch(e => console.log('Offline or API Error'));
}

// --- HELPER FUNCTIONS ---

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
        SOUNDS[name].play().catch(e => {}); // Catch play errors (user didn't interact yet)
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
        state.isMuted = true; // אופציונלי: השתקה בזמן פוז
    } else {
        btn.innerText = "PAUSE";
        state.isMuted = localStorage.getItem('boxingMuted') === 'true'; // שחזור מצב
    }
}

function endWorkout() {
    finishSession(); 
}

function resetApp() {
    location.reload();
}
