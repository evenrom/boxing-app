/* Pure timeline: rendering delays never add time to a workout. */
(function (root) {
  const WARMUP = 120, WORK = 300, REST = 30;
  const clampRounds = value => Number.isInteger(value) ? Math.min(20, Math.max(1, value)) : 7;
  const totalSeconds = rounds => WARMUP + clampRounds(rounds) * WORK + (clampRounds(rounds) - 1) * REST;
  function snapshot(elapsed, rounds) {
    rounds = clampRounds(rounds);
    elapsed = Math.max(0, elapsed);
    const total = totalSeconds(rounds);
    const base = { elapsed: Math.min(elapsed, total), totalRemaining: Math.max(0, Math.ceil(total - elapsed)), total, rounds };
    if (elapsed >= total) return { ...base, phase: 'done', remaining: 0, completed: rounds, round: rounds, duration: WORK };
    if (elapsed < WARMUP) return { ...base, phase: 'warmup', remaining: Math.ceil(WARMUP - elapsed), duration: WARMUP, round: 1, completed: 0 };
    const time = elapsed - WARMUP;
    const round = Math.floor(time / (WORK + REST)) + 1;
    const within = time % (WORK + REST);
    if (within >= WORK) return { ...base, phase: 'rest', remaining: Math.ceil(WORK + REST - within), duration: REST, round, completed: round };
    const minute = Math.floor(within / 60);
    return { ...base, phase: 'work', remaining: Math.ceil(WORK - within), duration: WORK, round, completed: round - 1, minute, minuteRemaining: Math.ceil(60 - within % 60), routineIndex: (round - 1) * 5 + minute };
  }
  // Never replay a backlog of missed cues after background throttling.
  function cue(previous, current) {
    if (!previous || current.elapsed <= previous.elapsed || current.elapsed - previous.elapsed > 1.5) return null;
    if (current.phase !== previous.phase || current.round !== previous.round) return 'bell';
    if (current.phase === 'work' && current.minute !== previous.minute) return 'minute';
    if (current.phase === 'warmup' && previous.remaining > 60 && current.remaining <= 60) return 'minute';
    if (current.remaining <= 10 && current.remaining > 0 && current.remaining !== previous.remaining) return 'tick';
    return null;
  }
  class Workout {
    constructor(rounds, now = () => Date.now()) {
      this.rounds = clampRounds(rounds); this.now = now; this.startedAt = now(); this.offset = 0; this.paused = false;
    }
    read() { return snapshot((this.offset + (this.paused ? 0 : this.now() - this.startedAt)) / 1000, this.rounds); }
    pause() { if (!this.paused) { this.offset += this.now() - this.startedAt; this.paused = true; } }
    resume() { if (this.paused) { this.startedAt = this.now(); this.paused = false; } }
  }
  const api = { snapshot, cue, Workout, clampRounds, totalSeconds };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BoxingTimer = api;
})(globalThis);
