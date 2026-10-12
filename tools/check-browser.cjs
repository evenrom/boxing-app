// Optional integration checks: requires Playwright and a local server on :4173.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const output = process.env.BOXING_SCREENSHOTS || path.join(__dirname, '..', '.artifacts');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    await fs.mkdir(output, { recursive: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install();
    await page.goto('http://127.0.0.1:4173');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.screenshot({ path: path.join(output, 'setup.png') });
    assert.equal(await page.locator('#totalTimePreview').textContent(), '40:00');
    await page.getByRole('button', { name: /Floyd Mayweather/ }).click();
    await page.getByRole('button', { name: 'More rounds' }).click();
    assert.equal(await page.locator('#totalTimePreview').textContent(), '45:30');
    await page.getByRole('button', { name: 'Fewer rounds' }).click();
    await page.getByRole('button', { name: 'Start training' }).click();
    assert.equal(await page.locator('#mainTimer').textContent(), '02:00');
    await page.waitForFunction(() => wakeLock !== null);
    await page.evaluate(() => wakeLock.release());
    assert.match(await page.locator('#screenStatus').textContent(), /RELEASED/);
    await page.locator('#mainTimer').click();
    await page.waitForFunction(() => wakeLock !== null);
    // Replace only the test clock anchor so exact phase boundaries are reproducible.
    await page.evaluate(() => { workout.offset = 0; workout.startedAt = Date.now(); previous = workout.read(); });
    await page.clock.runFor(120100);
    assert.equal(await page.locator('#statusText').textContent(), 'ROUND 01');
    assert.equal(await page.locator('#currentDescription').textContent(), "ג'אב מהיר (Flicker)");
    await page.getByRole('button', { name: 'Pause', exact: false }).click();
    const frozen = await page.locator('#mainTimer').textContent();
    await page.clock.fastForward(20000);
    assert.equal(await page.locator('#mainTimer').textContent(), frozen);
    await page.getByRole('button', { name: 'Resume', exact: false }).click();
    await page.clock.runFor(60000);
    assert.equal(await page.locator('#drillLabel').textContent(), 'MINUTE 2 OF 5');
    // Longest combinations must fit, including all tablet landscape sizes.
    await page.evaluate(() => { workout.offset = 780000; workout.startedAt = Date.now(); previous = workout.read(); tick(); });
    for (const [width, height] of [[1280,800], [1024,768], [1180,820], [960,600]]) {
      await page.setViewportSize({ width, height });
      const geometry = await page.evaluate(() => {
        const nodes = ['mainTimer','currentPattern','currentDescription','nextPattern','pauseBtn'];
        return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
          nodes: nodes.map(id => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return {id, right:r.right, bottom:r.bottom, overflow:e.scrollWidth>e.clientWidth+2}; }) };
      });
      assert.ok(geometry.scrollWidth <= width, JSON.stringify(geometry));
      for (const item of geometry.nodes) assert.ok(item.right <= width && item.bottom <= height && !item.overflow, JSON.stringify({width,height,item}));
    }
    const drillOverflows = await page.evaluate(() => {
      const failures = [], original = settings.intensity;
      for (const fighter of Object.keys(FIGHTER_ROUTINES)) {
        settings.intensity = fighter;
        for (let index = 0; index < 35; index++) {
          renderKey = '';
          renderWorkout(BoxingTimer.snapshot(120 + Math.floor(index / 5) * 330 + index % 5 * 60, 7));
          for (const id of ['currentPattern', 'currentDescription', 'nextPattern', 'nextDescription', 'pauseBtn']) {
            const element = document.getElementById(id), rect = element.getBoundingClientRect();
            if (element.scrollWidth > element.clientWidth + 2 || rect.right > innerWidth || rect.bottom > innerHeight) failures.push({ fighter, index, id });
          }
        }
      }
      settings.intensity = original; renderKey = ''; renderWorkout(workout.read());
      return failures;
    });
    assert.deepEqual(drillOverflows, []);
    await page.setViewportSize({width:1280,height:800});
    await page.screenshot({ path: path.join(output, 'workout.png') });
    await page.evaluate(() => { workout.offset = 420000; workout.startedAt = Date.now(); previous = workout.read(); tick(); });
    assert.equal(await page.locator('#statusText').textContent(), 'RECOVER');
    await page.screenshot({ path: path.join(output, 'rest.png') });
    await page.getByRole('button', { name: 'End session', exact: true }).click();
    await page.getByRole('button', { name: 'Keep training' }).click();
    await page.clock.runFor(100);
    assert.equal(await page.evaluate(() => workout.paused), false);
    await page.getByRole('button', { name: 'End session', exact: true }).click();
    await page.locator('dialog').getByRole('button', { name: 'End session', exact: true }).click();
    await page.clock.runFor(100);
    assert.equal(await page.locator('#finishRoundsVal').textContent(), '1 / 7');
    assert.equal(await page.locator('#finishTitle').textContent(), 'Session ended.');
    assert.equal(await page.evaluate(() => wakeLock), null);
    await page.getByRole('button', {name:'Back to training'}).click();
    await page.getByRole('button', { name: 'Start training' }).click();
    await page.evaluate(() => { workout.offset = 2399900; workout.startedAt = Date.now(); previous = workout.read(); });
    await page.clock.runFor(200);
    assert.equal(await page.locator('#finishRoundsVal').textContent(), '7 / 7');
    assert.equal(await page.locator('#finishDuration').textContent(), '40:00');
    await page.screenshot({ path: path.join(output, 'finish.png') });
    // An installed session must load its shell and all audio without a network.
    await context.setOffline(true);
    await page.reload();
    assert.equal(await page.locator('[data-fighter="MAYWEATHER"]').getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: 'Start training' }).click();
    const audio = await page.evaluate(async () => { await audioLoading; return { bell: !!buffers.bell, minute: !!buffers.minute, state: audioCtx.state }; });
    assert.deepEqual(audio, {bell:true, minute:true, state:'running'});
    console.log('Audio assets:', await page.evaluate(() => Object.fromEntries(Object.entries(buffers).map(([key, buffer]) => [key, {duration:buffer.duration, peakAtStart:Math.max(...buffer.getChannelData(0).slice(0, 48000).filter((_, index) => index % 10 === 0).map(Math.abs))}]))));
    await page.evaluate(() => playSound('bell'));
    assert.equal(await page.evaluate(() => sources.size), 1);
    await page.getByRole('button', { name:'Mute workout cues' }).click();
    assert.equal(await page.evaluate(() => sources.size), 0);
    await page.evaluate(() => finishSession(workout.read(), false));
    await page.getByRole('button', {name:'Back to training'}).click();
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage:true });
    assert.deepEqual(errors, []);
    console.log('PASS: setup, settings, warm-up, minutes, pause/resume, rest, end/cancel, completion, four landscape sizes, mobile, offline shell/audio, mute, wake-lock release/reacquisition; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
