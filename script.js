// ************************************************
// PASTE YOUR GOOGLE SCRIPT URL HERE INSIDE THE QUOTES
// ************************************************
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhFe573lGoje_TsHLZyOv9f4uO0Ccdxiw2J_tJtV8tGgTkyUq6MCTNemI2LkyrOH7t/exec";
// ************************************************

function triggerHaptic() { if (navigator.vibrate) navigator.vibrate(40); }

document.addEventListener('DOMContentLoaded', function() {
    let bell = new Audio('https://github.com/evenrom/boxing-timer-assets/raw/refs/heads/main/bell.mp3');
    let minute = new Audio('https://github.com/evenrom/boxing-timer-assets/raw/refs/heads/main/minute.mp3');
    let countdown = new Audio('https://github.com/evenrom/boxing-timer-assets/raw/refs/heads/main/countdown.mp3');

    const SETTINGS = {
        'ROOKIE': { roundTime: 180, restTime: 20, defaultRounds: 8 },
        'PRO':    { roundTime: 300, restTime: 30, defaultRounds: 6 },
        'CHAMP':  { roundTime: 600, restTime: 60, defaultRounds: 3 }
    };

    let currentDifficulty = 'ROOKIE';
    let targetRounds = 8;
    let phase = 'setup';
    let timerInterval = null;
    let wakeLock = null;
    let isPaused = false;
    let currentRound = 0;
    let phaseTimeLeft = 0;
    let totalSessionLeft = 0;
    let totalWorkSeconds = 0;

    const patternsSource = {
        1:["1","1-2","1-2-3"], 2:["1 ▲ 1","1-2-7-2","2-4"], 3:["1-1-2","1-4 ► 2","1-2-3"],
        4:["1-2-7-3","1 ◄ 1-2","1-3-7-3"], 5:["2-4 ◄ 4","1-2-7-2","1-2 ▲ 3"],
        6:["1-2-7-4-2","2 ▲ 4-4","1 ▲ 3-3"], 7:["1-3-7-4","2-4-7-3","1 ► 2-2"],
        8:["1-2-1-2-1-2","3-4-3-4-3-4","5-6-5-6-5-6"], 9:["1 ► 2-4","1-7-3","2-7-4"],
        10:["1 ▲ 1-2-7-2","2-4-7-2-4","1-2-3-7-2"]
    };

    function attachBtnEvent(id, func) {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener('click', (e) => { triggerHaptic(); func(e); });
    }

    attachBtnEvent('btn-rookie', () => selectDifficulty('ROOKIE'));
    attachBtnEvent('btn-pro', () => selectDifficulty('PRO'));
    attachBtnEvent('btn-champ', () => selectDifficulty('CHAMP'));
    attachBtnEvent('btn-minus', () => adjustRounds(-1));
    attachBtnEvent('btn-plus', () => adjustRounds(1));
    attachBtnEvent('btn-start-fight', startWorkout);
    attachBtnEvent('pauseBtn', togglePause);
    attachBtnEvent('stopBtn', resetApp);
    attachBtnEvent('btn-restart', resetApp);

    function selectDifficulty(level) {
        currentDifficulty = level;
        const config = SETTINGS[level];
        document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-${level.toLowerCase()}`).classList.add('active');
        targetRounds = config.defaultRounds;
        updateSetupUI();
    }

    function adjustRounds(delta) {
        targetRounds = Math.max(1, targetRounds + delta);
        updateSetupUI();
    }

    function calculateTotalTime() {
        const cfg = SETTINGS[currentDifficulty];
        return 60 + (targetRounds * cfg.roundTime) + ((targetRounds - 1) * cfg.restTime);
    }

    function updateSetupUI() {
        document.getElementById('setupRoundCount').innerText = targetRounds;
        document.getElementById('totalTimePreview').innerText = formatTime(calculateTotalTime());
    }

    async function requestWakeLock(){ if('wakeLock' in navigator){ try{ wakeLock = await navigator.wakeLock.request('screen'); }catch(e){} } }

    function startWorkout() {
        phase = 'warmup'; currentRound = 0; phaseTimeLeft = 60;
        totalSessionLeft = calculateTotalTime(); totalWorkSeconds = 0; isPaused = false;
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('timer-screen').style.display = 'flex';
        document.getElementById('finish-screen').style.display = 'none';
        requestWakeLock();
        bell.play().catch(e=>{});
        if(timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(tick, 1000);
        updateTimerUI();
    }

    function tick() {
        if(isPaused) return;
        phaseTimeLeft--; totalSessionLeft--;
        if(phase === 'work') {
            totalWorkSeconds++;
            if(phaseTimeLeft > 0 && phaseTimeLeft % 60 === 0) minute.play().catch(e=>{});
        }
        if(phaseTimeLeft === 10) countdown.play().catch(e=>{});
        if(phaseTimeLeft <= 0) handlePhaseChange();
        updateTimerUI();
    }

    function handlePhaseChange() {
        bell.play().catch(e=>{});
        const cfg = SETTINGS[currentDifficulty];
        if(phase === 'warmup') {
            phase = 'work'; currentRound = 1; phaseTimeLeft = cfg.roundTime;
        } else if (phase === 'work') {
            if(currentRound >= targetRounds) { finishWorkout(); return; }
            phase = 'rest'; phaseTimeLeft = cfg.restTime;
        } else if (phase === 'rest') {
            phase = 'work'; currentRound++; phaseTimeLeft = cfg.roundTime;
        }
    }

    function getPatternByWorkTime(workSeconds) {
        const globalMinuteIndex = Math.floor(workSeconds / 60);
        const sourceRound = Math.floor((globalMinuteIndex % 30) / 3) + 1;
        return patternsSource[sourceRound]?.[(globalMinuteIndex % 30) % 3] || "FREESTYLE";
    }

    function parseIcons(text) {
        if(!text) return '-';
        return text.replace(/▲/g,'<span class="material-symbols-outlined">keyboard_double_arrow_up</span>')
                    .replace(/▼/g,'<span class="material-symbols-outlined">keyboard_double_arrow_down</span>')
                    .replace(/◄/g,'<span class="material-symbols-outlined">keyboard_double_arrow_left</span>')
                    .replace(/►/g,'<span class="material-symbols-outlined">keyboard_double_arrow_right</span>');
    }

    function updateTimerUI() {
        const mainClock = document.getElementById('mainTimer');
        const statusText = document.getElementById('statusText');
        const root = document.documentElement;
        mainClock.innerText = formatTime(phaseTimeLeft);
        document.getElementById('totalTimer').innerText = formatTime(totalSessionLeft);

        if(phase === 'work') {
            root.style.setProperty('--work-color', '#0099ff');
            statusText.style.color = 'var(--work-color)'; statusText.innerText = `ROUND ${currentRound}`;
            const currentPat = getPatternByWorkTime(totalWorkSeconds);
            const nextPat = getPatternByWorkTime(totalWorkSeconds + 60);
            document.getElementById('currentPattern').innerHTML = parseIcons(currentPat);
            document.getElementById('nextPattern').innerHTML = parseIcons(nextPat);
        } else {
            root.style.setProperty('--work-color', '#00ff99');
            statusText.style.color = 'var(--rest-color)';
            statusText.innerText = phase === 'warmup' ? "WARM UP" : "REST";
            document.getElementById('currentPattern').innerText = phase === 'warmup' ? "GET READY" : "BREATHE";
            document.getElementById('nextPattern').innerText = `ROUND ${currentRound + 1} COMING UP`;
        }
    }

    function finishWorkout() {
        clearInterval(timerInterval);
        if(wakeLock) wakeLock.release();

        // --- SEND DATA TO GOOGLE SCRIPT ---
        const finalUrl = `${GOOGLE_SCRIPT_URL}?rounds=${targetRounds}&difficulty=${currentDifficulty}`;
        fetch(finalUrl, { mode: 'no-cors' }).then(() => console.log('Saved to Sheet'));

        document.getElementById('timer-screen').style.display = 'none';
        document.getElementById('finish-screen').style.display = 'flex';
        document.getElementById('finishLevelText').innerText = `${currentDifficulty} LEVEL COMPLETED`;
        document.getElementById('finishRoundsVal').innerText = targetRounds;
    }

    function togglePause() {
        isPaused = !isPaused;
        document.getElementById('pauseBtn').innerText = isPaused ? "RESUME" : "PAUSE";
    }

    function resetApp() {
        clearInterval(timerInterval);
        if(wakeLock) wakeLock.release();
        phase = 'setup'; selectDifficulty(currentDifficulty);
        document.getElementById('finish-screen').style.display = 'none';
        document.getElementById('timer-screen').style.display = 'none';
        document.getElementById('setup-screen').style.display = 'flex';
    }

    function formatTime(s) {
        if(s < 0) s=0;
        return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    }

    selectDifficulty('ROOKIE');
});
