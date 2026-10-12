# Rounds — boxing trainer

A static, offline-capable boxing timer. No backend, database, build step, accounts, or runtime dependencies.

## Run locally

With Node.js installed, run `npm start` and open http://127.0.0.1:4173. Run `npm test` for the timer and routine checks.

For a tablet, host these static files over **HTTPS** (for example GitHub Pages), open the site once online, and add it to the home screen. Localhost is also a secure context; plain HTTP on a LAN IP is not. The local preview server intentionally accepts connections only from this computer.

## Workout behavior

- Choose Tyson, Mayweather, or Ali; original Hebrew cues and 35 drills per style are preserved.
- 2-minute warm-up → 5-minute rounds → 30-second rests between rounds. No rest after the final round.
- Default: 7 rounds / 40 minutes. Choose 1–20 rounds; rounds beyond seven repeat the routine.
- Each work minute advances the combination and rings a short bell. Warm-up also has a minute bell. Every phase has ten individual countdown beeps in its final ten seconds; the clock changes color too.
- Pause freezes the clock and stops all cues. Ending asks for confirmation and counts only fully completed rounds. Opening that confirmation pauses the timer; cancel restores its prior pause state.
- Only style, round count, and mute preference are saved locally. No workout history is collected.

## Screen and audio

The app requests Screen Wake Lock for the whole session, including pauses, restores it on return to the app, retries on touch after release, and releases it at the end. The header reports whether it actually holds the lock. HTTPS, browser support, battery saver, and OS policies can affect availability; a failure is shown rather than silently ignored.

Start Spotify first, then start the workout. Cues use Web Audio and request `navigator.audioSession.type = 'ambient'` when supported. The app does not use media playback controls, a silent video, or an exclusive audio session. Existing bell samples are shortened; the countdown uses individually timed tones so pausing or muting stops immediately. A synthesized bell is the fallback if a sample fails.

**Spotify coexistence must be checked on the target tablet.** Web apps cannot guarantee OS audio mixing on every browser. See [AudioSession types](https://developer.mozilla.org/en-US/docs/Web/API/AudioSession/type) and [Screen Wake Lock](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API). Keep the workout visible: browsers may suspend background audio and callbacks. On return, elapsed wall time restores the correct phase without replaying missed sounds. Changing the system clock during a session can affect elapsed time.

## Offline and updates

All required styles, scripts, icons, and bell audio are local and precached. No CDN or Google Fonts dependency. The countdown MP3 is retained as an original asset but is no longer used. Updates wait until existing app windows close, avoiding changes mid-workout. After deployment, close all old tabs and installed-app windows, then reopen to activate an update. Bump `CACHE_NAME` in `sw.js` for subsequent releases. Cache cleanup only touches this app's `boxing-pro-*` caches.

## Code and verification

- `timer.js`: deterministic phase snapshots, cue boundaries, pause/resume clock; tested with Node's built-in runner.
- `routines.js`: original style programs.
- `script.js`: UI, local preferences, Web Audio, wake lock.
- `style.css`: landscape-first layout, responsive fallback, local system fonts.
- `tools/check-browser.cjs`: optional Playwright integration checks (requires Playwright and Microsoft Edge; start the local server first). Run `node tools/check-browser.cjs` with Playwright available to Node. Screenshots default to ignored `.artifacts/`, or set `BOXING_SCREENSHOTS`.

Browser checks cover setup and preference persistence, warm-up/minute transitions, pause/resume, recovery, end/cancel, natural completion, wake-lock release/reacquisition, offline reload and decoded audio, mute, 960×600 / 1024×768 / 1180×820 / 1280×800 landscape layouts, and 390px mobile overflow.

The files in `doc/` are the original design briefs. This README describes the current implementation.
