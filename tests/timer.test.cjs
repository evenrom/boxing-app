const { test } = require('node:test');
const assert = require('node:assert/strict');
const { snapshot, totalSeconds, cue, Workout, clampRounds } = require('../timer.js');

test('duration includes warm-up and only rests between rounds', () => {
  assert.equal(totalSeconds(1), 420);
  assert.equal(totalSeconds(7), 2400);
  assert.equal(totalSeconds(20), 6690);
});
test('warm-up, work, minute and recovery boundaries are exact', () => {
  assert.equal(snapshot(119.999, 7).remaining, 1);
  assert.equal(snapshot(120, 7).phase, 'work');
  assert.equal(snapshot(120, 7).remaining, 300);
  assert.equal(snapshot(179.999, 7).minute, 0);
  assert.equal(snapshot(180, 7).minute, 1);
  assert.equal(snapshot(419.999, 7).remaining, 1);
  assert.equal(snapshot(420, 7).phase, 'rest');
  assert.equal(snapshot(420, 7).completed, 1);
  assert.equal(snapshot(450, 7).phase, 'work');
  assert.equal(snapshot(450, 7).round, 2);
  assert.equal(snapshot(450, 7).routineIndex, 5);
});
test('final round completes with no extra rest and never negative time', () => {
  for (const rounds of [1, 7, 20]) {
    assert.equal(snapshot(totalSeconds(rounds) - .1, rounds).phase, 'work');
    const final = snapshot(totalSeconds(rounds) + 20, rounds);
    assert.equal(final.phase, 'done'); assert.equal(final.completed, rounds);
    assert.equal(final.totalRemaining, 0); assert.equal(final.elapsed, totalSeconds(rounds));
  }
});
test('early exit counts only fully completed rounds', () => {
  for (const seconds of [0, 119, 120, 300, 419]) assert.equal(snapshot(seconds, 7).completed, 0);
  assert.equal(snapshot(500, 7).completed, 1);
});
test('clock catches up across skipped callbacks and freezes fractional time on pause', () => {
  let time = 1000;
  const workout = new Workout(7, () => time);
  time += 180250;
  assert.equal(workout.read().minute, 1);
  assert.equal(workout.read().remaining, 240);
  workout.pause(); time += 1000000;
  assert.equal(workout.read().elapsed, 180.25);
  workout.pause(); workout.resume(); workout.resume(); time += 750;
  assert.equal(workout.read().elapsed, 181);
  assert.equal(workout.read().remaining, 239);
});
test('bells at each minute, round transitions and finish; ten individual countdown ticks', () => {
  assert.equal(cue(snapshot(59.9, 7), snapshot(60, 7)), 'minute');
  assert.equal(cue(snapshot(119.9, 7), snapshot(120, 7)), 'bell');
  for (const second of [180, 240, 300, 360]) assert.equal(cue(snapshot(second - .1, 7), snapshot(second, 7)), 'minute');
  for (const second of [420, 450, 2400]) assert.equal(cue(snapshot(second - .1, 7), snapshot(second, 7)), 'bell');
  for (const second of [110, 410, 440]) {
    for (let i = 0; i < 10; i++) assert.equal(cue(snapshot(second + i - .1, 7), snapshot(second + i, 7)), 'tick');
  }
  assert.equal(cue(snapshot(410, 7), snapshot(410.1, 7)), null);
  assert.equal(cue(snapshot(100, 7), snapshot(450, 7)), null);
});
test('round settings reject corrupt values and enforce limits', () => {
  for (const value of [undefined, null, '8', {}, 2.5, NaN, Infinity]) assert.equal(clampRounds(value), 7);
  assert.equal(clampRounds(-5), 1); assert.equal(clampRounds(300), 20);
});
test('each fighter has 35 valid drills and loops at round eight', () => {
  const fs = require('node:fs'), vm = require('node:vm');
  const routines = vm.runInNewContext(fs.readFileSync(require.resolve('../routines.js'), 'utf8') + '; FIGHTER_ROUTINES');
  for (const routine of Object.values(routines)) {
    assert.equal(routine.plan.length, 35); assert.equal(routine.roundFocus.length, 7);
    for (const drill of routine.plan) { assert.match(drill.combo, /^[1-47 ▲◄►-]+$/); assert.ok(drill.desc); }
    assert.equal(snapshot(120 + 7 * 330, 8).routineIndex % routine.plan.length, 0);
  }
});
