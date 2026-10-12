'use strict';
const $ = id => document.getElementById(id);
const settings = { intensity: 'TYSON', targetRounds: 7, isMuted: false };
let workout = null, interval = null, previous = null, renderKey = '', wakeLock = null, wakePending = false;
let audioCtx = null, audioLoading = null;
const buffers = {}, sources = new Set(), notices = new Map();
const formatTime = seconds => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;
function notice(key, message) {
  if (message) notices.set(key, message); else notices.delete(key);
  $('notice').textContent = [...notices.values()].join(' ');
  $('notice').hidden = !notices.size;
}
function loadSettings() {
  try {
    const data = JSON.parse(localStorage.getItem('boxing_system_settings'));
    if (data && typeof data === 'object') {
      if (Object.hasOwn(FIGHTER_ROUTINES, data.intensity)) settings.intensity = data.intensity;
      settings.targetRounds = BoxingTimer.clampRounds(data.allocated_rounds);
      settings.isMuted = data.system_mute_flag === true;
    }
  } catch { /* A corrupt or unavailable store must not prevent training. */ }
}
function saveSettings() {
  try { localStorage.setItem('boxing_system_settings', JSON.stringify({ intensity: settings.intensity, allocated_rounds: settings.targetRounds, system_mute_flag: settings.isMuted })); } catch { /* Preferences are optional. */ }
}
function renderSettings() {
  document.querySelectorAll('[data-fighter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.fighter === settings.intensity)));
  $('setupRoundCount').textContent = settings.targetRounds;
  $('totalTimePreview').textContent = formatTime(BoxingTimer.totalSeconds(settings.targetRounds));
  $('btn-minus').disabled = settings.targetRounds === 1;
  $('btn-plus').disabled = settings.targetRounds === 20;
  $('muteBtn').textContent = settings.isMuted ? 'Sound off' : 'Sound on';
  $('muteBtn').setAttribute('aria-pressed', String(settings.isMuted));
  $('muteBtn').setAttribute('aria-label', settings.isMuted ? 'Unmute workout cues' : 'Mute workout cues');
}
// Called directly inside a gesture: create/resume before any asynchronous fetch.
function prepareAudio() {
  if (settings.isMuted) return;
  try {
    if ('audioSession' in navigator) { try { navigator.audioSession.type = 'ambient'; } catch {} }
    if (!audioCtx) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error('Audio unavailable');
      audioCtx = new Context();
      audioCtx.addEventListener('statechange', () => {
        if (workout && !settings.isMuted) notice('audio', audioCtx.state === 'running' ? '' : 'Sound is interrupted. Tap Sound off, then Sound on to restore cues.');
      });
    }
    const resumed = audioCtx.resume();
    resumed.then(() => notice('audio', '')).catch(() => notice('audio', 'Sound is unavailable. Tap Sound off, then Sound on to retry.'));
    if (!audioLoading) audioLoading = Promise.all(['bell', 'minute'].map(async name => {
      try {
        const response = await fetch(`./assets/${name}.mp3`);
        if (!response.ok) throw new Error('Missing cue');
        buffers[name] = await audioCtx.decodeAudioData(await response.arrayBuffer());
      } catch { /* Synthesized bell is available when a local sample cannot load. */ }
    }));
    return resumed;
  } catch { notice('audio', 'Audio cues are unavailable in this browser. The visual countdown will still run.'); }
}
function stopSounds() {
  for (const source of sources) { try { source.stop(); } catch {} }
  sources.clear();
}
function playSound(name) {
  if (settings.isMuted || !audioCtx || audioCtx.state !== 'running') return;
  stopSounds();
  const now = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.connect(audioCtx.destination);
  let source;
  if (buffers[name]) {
    source = audioCtx.createBufferSource(); source.buffer = buffers[name];
    const duration = Math.min(source.buffer.duration, name === 'minute' ? 1.2 : 2);
    gain.gain.setValueAtTime(.65, now);
    gain.gain.setValueAtTime(.65, now + Math.max(0, duration - .1));
    gain.gain.linearRampToValueAtTime(0, now + duration);
    source.connect(gain); source.start(now); source.stop(now + duration);
  } else {
    source = audioCtx.createOscillator(); source.type = 'sine';
    source.frequency.value = name === 'tick' ? 880 : 1250;
    const duration = name === 'tick' ? .12 : .8;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.3, now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    source.connect(gain); source.start(now); source.stop(now + duration);
  }
  sources.add(source);
  source.onended = () => {
    sources.delete(source); source.disconnect(); gain.disconnect();
    if (!workout && !sources.size) audioCtx.suspend().catch(() => {});
  };
}
async function requestWakeLock() {
  if (!workout || document.visibilityState !== 'visible' || wakeLock || wakePending) return;
  if (!navigator.wakeLock) { $('screenStatus').textContent = 'SCREEN LOCK UNAVAILABLE'; notice('wake', 'Screen wake lock is unavailable. Keep the screen awake in your tablet settings.'); return; }
  wakePending = true;
  try {
    const lock = await navigator.wakeLock.request('screen');
    if (!workout || document.visibilityState !== 'visible') { await lock.release(); return; }
    wakeLock = lock;
    $('screenStatus').textContent = '● SCREEN STAYS ON'; notice('wake', '');
    lock.addEventListener('release', () => {
      if (wakeLock !== lock) return;
      wakeLock = null;
      if (workout) { $('screenStatus').textContent = 'SCREEN LOCK RELEASED'; if (document.visibilityState === 'visible') notice('wake', 'Screen wake lock was released. Tap the screen to retry, or adjust tablet sleep settings.'); }
    });
  } catch { if (workout) { $('screenStatus').textContent = 'SCREEN LOCK UNAVAILABLE'; notice('wake', 'Screen wake lock was denied. Check battery saver and tablet sleep settings.'); } }
  finally { wakePending = false; }
}
function releaseWakeLock() {
  const lock = wakeLock; wakeLock = null;
  if (lock) lock.release().catch(() => {});
  $('screenStatus').textContent = 'READY WHEN YOU ARE'; notice('wake', '');
}
function showScreen(name) { ['setup', 'timer', 'finish'].forEach(id => { $(`${id}-screen`).hidden = id !== name; }); }
function startWorkout() {
  if (workout) return;
  const audioReady = prepareAudio();
  workout = new BoxingTimer.Workout(settings.targetRounds);
  const session = workout;
  audioReady?.then(() => {
    if (workout === session && !session.paused && session.read().elapsed < 1) playSound('bell');
  }).catch(() => {});
  previous = workout.read(); renderKey = '';
  showScreen('timer'); requestWakeLock();
  renderWorkout(previous);
  interval = setInterval(tick, 100);
  $('pauseBtn').focus();
}
function tick() {
  if (!workout || workout.paused) return;
  const current = workout.read();
  const sound = BoxingTimer.cue(previous, current);
  if (sound) playSound(sound);
  previous = current;
  if (current.phase === 'done') { finishSession(current, true); return; }
  renderWorkout(current);
}
function renderCombo(combo) {
  const row = document.createElement('div'); row.className = 'combo-sequence';
  row.setAttribute('aria-label', combo);
  for (const token of combo.match(/\d+|[-▲◄►]/g) || []) {
    const span = document.createElement('span');
    span.className = /^\d+$/.test(token) ? 'combo-token' : token === '-' ? 'combo-dash' : 'combo-move';
    span.textContent = token; row.append(span);
  }
  $('currentPattern').replaceChildren(row);
}
function renderWorkout(state) {
  document.body.dataset.phase = state.phase;
  document.body.classList.toggle('is-countdown', state.remaining <= 10);
  document.body.classList.toggle('is-paused', workout.paused);
  $('pauseLabel').hidden = !workout.paused;
  $('pauseBtn').textContent = workout.paused ? '▶ Resume' : 'Ⅱ Pause';
  $('mainTimer').textContent = formatTime(state.remaining);
  $('totalTimer').textContent = formatTime(state.totalRemaining);
  $('phaseProgress').style.width = `${state.remaining / state.duration * 100}%`;
  $('completedIndicator').textContent = `${state.completed} / ${state.rounds} COMPLETE`;
  $('minuteTimer').textContent = state.phase === 'work' ? `${formatTime(state.minuteRemaining)} LEFT` : '';
  const key = `${state.phase}-${state.round}-${state.minute}`;
  if (key === renderKey) return;
  renderKey = key;
  const routine = FIGHTER_ROUTINES[settings.intensity];
  $('workoutStyle').textContent = routine.name.toUpperCase();
  $('roundIndicator').textContent = state.phase === 'warmup' ? `${state.rounds} ROUNDS AHEAD` : `ROUND ${state.round} / ${state.rounds}`;
  $('statusText').textContent = state.phase === 'work' ? `ROUND ${String(state.round).padStart(2, '0')}` : state.phase === 'rest' ? 'RECOVER' : 'WARM-UP';
  $('minuteSteps').replaceChildren();
  $('nextLabel').textContent = 'UP NEXT';
  if (state.phase === 'work') {
    const drill = routine.plan[state.routineIndex % routine.plan.length];
    renderCombo(drill.combo); $('currentDescription').textContent = drill.desc;
    $('drillLabel').textContent = `MINUTE ${state.minute + 1} OF 5`;
    for (let i = 0; i < 5; i++) { const step = document.createElement('span'); step.className = i <= state.minute ? 'active' : ''; $('minuteSteps').append(step); }
    $('minuteSteps').setAttribute('aria-label', `Minute ${state.minute + 1} of 5`);
    $('roundFocus').textContent = routine.roundFocus[(state.round - 1) % routine.roundFocus.length];
    if (state.minute === 4) {
      $('nextPattern').textContent = state.round === state.rounds ? 'Session complete' : '30-second recovery';
      $('nextDescription').textContent = state.round === state.rounds ? 'Finish strong. This is your final minute.' : 'Breathe. Reset. Get ready for the next round.';
    } else {
      const next = routine.plan[(state.routineIndex + 1) % routine.plan.length];
      $('nextPattern').textContent = next.combo; $('nextPattern').dir = 'ltr'; $('nextDescription').textContent = next.desc;
    }
  } else {
    const nextRound = state.phase === 'rest' ? state.round + 1 : 1;
    const next = routine.plan[((nextRound - 1) * 5) % routine.plan.length];
    $('drillLabel').textContent = state.phase === 'rest' ? 'EARN YOUR RECOVERY' : 'BEFORE THE BELL';
    $('currentPattern').textContent = state.phase === 'rest' ? 'Breathe.' : 'Get loose.';
    $('currentDescription').textContent = state.phase === 'rest' ? 'Relax your shoulders. Control your breathing.' : 'Light footwork. Loose shoulders. Find your rhythm.';
    $('nextLabel').textContent = `UP NEXT · ROUND ${nextRound}`;
    $('nextPattern').textContent = next.combo; $('nextPattern').dir = 'ltr'; $('nextDescription').textContent = next.desc;
    $('roundFocus').textContent = routine.roundFocus[(nextRound - 1) % routine.roundFocus.length];
  }
}
function togglePause() {
  if (!workout) return;
  if (workout.paused) { prepareAudio(); workout.resume(); previous = workout.read(); requestWakeLock(); }
  else { tick(); if (!workout) return; workout.pause(); stopSounds(); }
  renderWorkout(workout.read());
}
function finishSession(state, complete) {
  clearInterval(interval); interval = null; workout = null; previous = null;
  if (!complete) stopSounds();
  if (!sources.size && audioCtx) audioCtx.suspend().catch(() => {});
  releaseWakeLock(); notice('audio', '');
  document.body.dataset.phase = ''; document.body.classList.remove('is-paused', 'is-countdown');
  $('finishTitle').textContent = complete ? 'Session complete.' : 'Session ended.';
  $('finishLevelText').textContent = FIGHTER_ROUTINES[settings.intensity].name + ' · ' + (complete ? 'All rounds in the bag.' : 'Every minute counts.');
  $('finishRoundsVal').textContent = `${state.completed} / ${state.rounds}`;
  $('finishDuration').textContent = formatTime(Math.floor(state.elapsed));
  showScreen('finish'); $('btn-restart').focus();
}
let pausedBeforeDialog = false;
$('stopBtn').addEventListener('click', () => {
  if (!workout) return;
  tick(); if (!workout) return;
  pausedBeforeDialog = workout.paused;
  workout.pause(); stopSounds(); renderWorkout(workout.read());
  $('endDialog').returnValue = 'continue'; $('endDialog').showModal();
});
$('endDialog').addEventListener('close', () => {
  if (!workout) return;
  if ($('endDialog').returnValue === 'end') finishSession(workout.read(), false);
  else { if (!pausedBeforeDialog) togglePause(); $('pauseBtn').focus(); }
});
$('pauseBtn').addEventListener('click', togglePause);
$('btn-start-fight').addEventListener('click', startWorkout);
$('btn-restart').addEventListener('click', () => { stopSounds(); showScreen('setup'); $('btn-start-fight').focus(); });
$('muteBtn').addEventListener('click', () => {
  settings.isMuted = !settings.isMuted;
  if (settings.isMuted) {
    stopSounds(); notice('audio', '');
    if (audioCtx) audioCtx.suspend().catch(() => {});
  } else prepareAudio();
  saveSettings(); renderSettings();
});
for (const [id, delta] of [['btn-minus', -1], ['btn-plus', 1]]) $(id).addEventListener('click', () => { settings.targetRounds = BoxingTimer.clampRounds(settings.targetRounds + delta); saveSettings(); renderSettings(); });
for (const button of document.querySelectorAll('[data-fighter]')) button.addEventListener('click', () => { settings.intensity = button.dataset.fighter; saveSettings(); renderSettings(); });
$('fullscreenBtn').hidden = !document.fullscreenEnabled;
$('fullscreenBtn').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { notice('fullscreen', 'Full screen is unavailable. You can still train in this view.'); }
});
document.addEventListener('fullscreenchange', () => { $('fullscreenBtn').setAttribute('aria-label', document.fullscreenElement ? 'Exit full screen' : 'Enter full screen'); notice('fullscreen', ''); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && workout) { tick(); requestWakeLock(); }
  else stopSounds();
});
document.addEventListener('pointerdown', () => { if (workout && !wakeLock) requestWakeLock(); });
document.querySelector('.brand').addEventListener('click', event => { if (workout) { event.preventDefault(); $('stopBtn').click(); } });
window.addEventListener('beforeunload', event => { if (workout) { event.preventDefault(); event.returnValue = ''; } });
loadSettings(); renderSettings();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => notice('offline', 'Offline setup failed. Keep this page open and connected for this session.'));
