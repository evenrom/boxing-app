const { test } = require('node:test');
const assert = require('node:assert/strict');
const { FIGHTER_ROUTINES, getRoutineRoundIndex, getRoutineDrill } = require('../routines.js');

test('every style has seven complete rounds with no duplicate combinations', () => {
  for (const routine of Object.values(FIGHTER_ROUTINES)) {
    assert.equal(routine.roundFocus.length, 7);
    assert.equal(routine.plan.length, 35);
    assert.equal(new Set(routine.plan.map(drill => drill.combo)).size, 35, routine.name);
    for (const drill of routine.plan) {
      assert.match(drill.combo, /^[1-6 ▲◄►-]+$/);
      assert.ok(drill.desc);
      assert.ok((drill.combo.match(/[1-6]/g) || []).length <= 6, drill.combo);
    }
  }
});

test('all styles start with calm straight punches, then build complexity by round', () => {
  for (const routine of Object.values(FIGHTER_ROUTINES)) {
    for (const drill of routine.plan.slice(0, 5)) {
      assert.match(drill.combo, /^[12-]+$/);
      assert.ok(drill.combo.match(/[12]/g).length <= 3);
    }
    // Count actions, including steps/head movement, to catch accidental resets
    // to one-punch drills halfway through a progressive program.
    let previousAverage = 0;
    for (let round = 1; round <= 7; round++) {
      const drills = Array.from({ length: 5 }, (_, minute) => getRoutineDrill(routine, round, minute));
      const average = drills.reduce((sum, drill) => sum + drill.combo.match(/[1-6▲◄►]/g).length, 0) / 5;
      assert.ok(average >= previousAverage, `${routine.name}, round ${round}`);
      previousAverage = average;
    }
  }
});

test('reflex-bag routines have only one optional shadow uppercut and no body targets', () => {
  for (const [fighter, routine] of Object.entries(FIGHTER_ROUTINES)) {
    const uppercuts = routine.plan.filter(drill => /[56]/.test(drill.combo));
    assert.equal(uppercuts.length, fighter === 'TYSON' ? 1 : 0);
    for (const drill of uppercuts) {
      assert.match(drill.desc, /באוויר/);
      assert.match(drill.desc, /3 במקום 5/);
    }
    for (const drill of routine.plan) assert.doesNotMatch(drill.desc, /גוף/);
  }
});

test('the styles retain distinct technical emphasis', () => {
  const tyson = FIGHTER_ROUTINES.TYSON.plan;
  const mayweather = FIGHTER_ROUTINES.MAYWEATHER.plan;
  const ali = FIGHTER_ROUTINES.ALI.plan;
  assert.ok(tyson.filter(drill => /[34]/.test(drill.combo)).length >= 25, 'Tyson: compact hooks');
  assert.ok(tyson.filter(drill => /▲/.test(drill.combo)).length >= 10, 'Tyson: head movement');
  assert.ok(mayweather.filter(drill => /▲/.test(drill.combo)).length >= 15, 'Mayweather: defense/counter timing');
  assert.ok(mayweather.filter(drill => /[◄►]/.test(drill.combo)).length >= 10, 'Mayweather: angle exits');
  assert.ok(ali.every(drill => !/[3-6]/.test(drill.combo)), 'Ali: straight punches');
  assert.ok(ali.filter(drill => /[◄►]/.test(drill.combo)).length >= 15, 'Ali: footwork');
});

test('extended sessions keep advanced work instead of restarting the basics', () => {
  for (const routine of Object.values(FIGHTER_ROUTINES)) {
    for (let round = 1; round <= 7; round++) assert.equal(getRoutineRoundIndex(round), round - 1);
    for (let round = 8; round <= 20; round++) {
      const stage = getRoutineRoundIndex(round);
      assert.ok(stage >= 5 && stage <= 6);
      assert.notEqual(stage, getRoutineRoundIndex(round - 1));
      for (let minute = 0; minute < 5; minute++) {
        const drill = getRoutineDrill(routine, round, minute);
        assert.ok(drill);
        assert.doesNotMatch(drill.combo, /[56]/);
      }
    }
  }
});
