# Rounds — boxing trainer

A static, offline-capable boxing timer. No backend, database, build step, accounts, or runtime dependencies.

## Run locally

With Node.js installed, run `npm start` and open http://127.0.0.1:4173. Run `npm test` for the timer and routine checks.

For a tablet, host these static files over **HTTPS** (for example GitHub Pages), open the site once online, and add it to the home screen. Localhost is also a secure context; plain HTTP on a LAN IP is not. The local preview server intentionally accepts connections only from this computer.

## Workout behavior

- Choose Tyson, Mayweather, or Ali; each has 35 different combinations with Hebrew coaching cues, in a fixed order.
- 2-minute warm-up → 5-minute rounds → 30-second rests between rounds. No rest after the final round.
- Default: 7 rounds / 40 minutes. Choose 1–20 rounds. The seven-stage progression starts with calm straight punches, adds movement and short combinations, then builds to integrated five- and six-punch chains. Shorter sessions stop at the selected round. Rounds 8–20 alternate stages 6 and 7 to practice advanced work, rather than restarting the opening drills.
- Each work minute advances the combination and rings a short bell. Warm-up also has a minute bell. Every phase has ten individual countdown beeps in its final ten seconds; the clock changes color too.
- Pause freezes the clock and stops all cues. Ending asks for confirmation and counts only fully completed rounds. Opening that confirmation pauses the timer; cancel restores its prior pause state.
- Only style, round count, and mute preference are saved locally. No workout history is collected.

## Reflex-bag programs

The programs are adapted to a small reflex ball on a spring stand, with controlled contact and small steps. There are no body-shot targets. Each minute repeats its displayed combination deliberately; the combination changes at the next minute. The same exact combination is not duplicated within a style's first seven rounds.

- **Tyson:** compact hooks, head movement, angle changes, and controlled close-range pressure. One optional uppercut drill in round 5, minute 3: `1-2-5-2`. Throw the uppercut in the air, or substitute a left hook (`3`) to stay on the ball. It does not recur in extra rounds.
- **Mayweather:** precise straights, simulated pulls/slips before counters, and lateral exits. No uppercuts.
- **Ali:** relaxed jabs, straight-punch flurries, rhythm changes, and footwork. No uppercuts.

Punch key: 1 jab, 2 cross, 3 left hook, 4 right hook, 5 left uppercut, 6 right uppercut. The old ambiguous `7` has been removed. Current and next exercise numbers are 15% larger.

These are custom style-inspired drills, not the fighters' actual training programs. Design references: [IBA coaching manual](https://www.iba.sport/documents/iba-coach-manual/), [peekaboo fundamentals](https://evolve-mma.com/blog/beginners-guide-to-the-peekaboo-style/), and [Ali's circle and jab](https://modernmartialartist.com/muhammad-ali-footwork-jab-circle-technique-breakdown/).

## Screen and audio

The app requests Screen Wake Lock for the whole session, including pauses, restores it on return to the app, retries on touch after release, and releases it at the end. The header reports whether it actually holds the lock. HTTPS, browser support, battery saver, and OS policies can affect availability; a failure is shown rather than silently ignored.

Start Spotify first, then start the workout. Cues use Web Audio and request `navigator.audioSession.type = 'ambient'` when supported. The app does not use media playback controls, a silent video, or an exclusive audio session. Existing bell samples are shortened; the countdown uses individually timed tones so pausing or muting stops immediately. A synthesized bell is the fallback if a sample fails.

**Spotify coexistence must be checked on the target tablet.** Web apps cannot guarantee OS audio mixing on every browser. See [AudioSession types](https://developer.mozilla.org/en-US/docs/Web/API/AudioSession/type) and [Screen Wake Lock](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API). Keep the workout visible: browsers may suspend background audio and callbacks. On return, elapsed wall time restores the correct phase without replaying missed sounds. Changing the system clock during a session can affect elapsed time.

## Offline and updates

All required styles, scripts, icons, and bell audio are local and precached. No CDN or Google Fonts dependency. The countdown MP3 is retained as an original asset but is no longer used. Updates wait until existing app windows close, avoiding changes mid-workout. After deployment, close all old tabs and installed-app windows, then reopen to activate an update. Bump `CACHE_NAME` in `sw.js` for subsequent releases. Cache cleanup only touches this app's `boxing-pro-*` caches.

## Code and verification

- `timer.js`: deterministic phase snapshots, cue boundaries, pause/resume clock; tested with Node's built-in runner.
- `routines.js`: progressive style programs and consistent drill selection for work/recovery previews and extra rounds.
- `script.js`: UI, local preferences, Web Audio, wake lock.
- `style.css`: landscape-first layout, responsive fallback, local system fonts.
- `tools/check-browser.cjs`: optional Playwright integration checks (requires Playwright and Microsoft Edge; start the local server first). Run `node tools/check-browser.cjs` with Playwright available to Node. Screenshots default to ignored `.artifacts/`, or set `BOXING_SCREENSHOTS`.

Browser checks cover setup and preference persistence, warm-up/minute transitions, pause/resume, recovery, end/cancel, natural completion, wake-lock release/reacquisition, offline reload and decoded audio, mute, 960×600 / 1024×768 / 1180×820 / 1280×800 landscape layouts, and 390px mobile overflow.

The files in `doc/` are the original design briefs. This README describes the current implementation.
