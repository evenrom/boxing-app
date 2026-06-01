\# Engineering Implementation \& Technical Blueprint



\## 1. Directory Structure Blueprint

```text

boxing-countdown-pwa/

├── assets/

│   ├── bell.mp3

│   ├── countdown.mp3

│   ├── minute.mp3

│   └── icon.png

├── index.html

├── style.css

├── script.js

├── manifest.json

└── sw.js

2\. Local State Object Architecture

JavaScript

const appState = {

&#x20; settings: {

&#x20;   intensity: 'PRO', // ROOKIE, PRO, CHAMP

&#x20;   targetRounds: 12,

&#x20;   isMuted: false

&#x20; },

&#x20; engine: {

&#x20;   phase: 'SETUP', // SETUP, WARMUP, WORK, REST, FINISHED

&#x20;   currentRound: 1,

&#x20;   elapsedPhaseSeconds: 0,

&#x20;   elapsedTotalSeconds: 0,

&#x20;   workSecondsGlobal: 0

&#x20; },

&#x20; pools: {

&#x20;   masterCombos: \[

&#x20;     "1", "1-2", "1-2-3", "1 ▲ 1", "1-2-7-2", "2-4", "1-1-2", 

&#x20;     "1-2 ► 4", "1-3", "1-2-7-3", "1 ◄ 1-2", "1-3-7-3", "2-4-7-4", 

&#x20;     "1-2-7-2", "1-2 ▲ 3", "1-2-7-4-2", "2 ▲ 4-4", "1 ▲ 3-3", 

&#x20;     "1-3-7-3", "2-4-7-4", "1 ► 2-2", "1-2-1-2-1-2", "3-4-3-4-3-4", 

&#x20;     "2 ► 1-3", "1 ► 2-4", "1-7-3", "2-7-4", "1 ▲ 1-2-7-2", "2-4-7-2-4", "1-2-3-7-2"

&#x20;   ],

&#x20;   shuffledDeck: \[],

&#x20;   activeComboIndex: 0

&#x20; },

&#x20; intervals: {

&#x20;   tickerId: null

&#x20; }

};

3\. Component Architecture Specification

UI Context Split Router:



Component Container Dom Targets: Manage layout routing using explicit HTML visibility properties.



Visibility Control Scheme: Set targeted view wrapper blocks via CSS configurations display: none / display: flex using application state parameter routing mappings.



50/50 Operational Work Display Grid:



Left Structural Grid Panel: Hosts chronological down-counter metrics block. Uses high-contrast variable display typography tracking current state flags.



Right Structural Grid Panel: Double stacked instruction containers. Upper section isolates active combinations with large typography font layout styles; lower card displays dimmed upcoming elements map data model paths.



4\. Core Algorithmic Operational Steps

Operational Target A: Audio Pool Deployment

JavaScript

const audioContextOptions = {

&#x20; bell: './assets/bell.mp3',

&#x20; minute: './assets/minute.mp3',

&#x20; countdown: './assets/countdown.mp3'

};



const audioBuffers = {};



async function initializeAudioEngine() {

&#x20; const AudioContextClass = window.AudioContext || window.webkitAudioContext;

&#x20; const ctx = new AudioContextClass();

&#x20; 

&#x20; for (const \[key, path] of Object.entries(audioContextOptions)) {

&#x20;   const data = await fetch(path);

&#x20;   const arrayBuffer = await data.arrayBuffer();

&#x20;   audioBuffers\[key] = await ctx.decodeAudioData(arrayBuffer);

&#x20; }

&#x20; return ctx;

}

Operational Target B: Non-Repeating Card Shuffle Execution

JavaScript

function executeDeckShuffle() {

&#x20; let sourceArray = \[...appState.pools.masterCombos];

&#x20; let iterations = sourceArray.length;

&#x20; 

&#x20; while (iterations !== 0) {

&#x20;   let randomIndex = Math.floor(Math.random() \* iterations);

&#x20;   iterations--;

&#x20;   

&#x20;   let temporaryValue = sourceArray\[iterations];

&#x20;   sourceArray\[iterations] = sourceArray\[randomIndex];

&#x20;   sourceArray\[randomIndex] = temporaryValue;

&#x20; }

&#x20; 

&#x20; appState.pools.shuffledDeck = sourceArray;

&#x20; appState.pools.activeComboIndex = 0;

}



function retrieveNextTacticalCombo() {

&#x20; if (appState.pools.shuffledDeck.length === 0 || 

&#x20;     appState.pools.activeComboIndex >= appState.pools.shuffledDeck.length) {

&#x20;   executeDeckShuffle();

&#x20; }

&#x20; 

&#x20; const currentCombo = appState.pools.shuffledDeck\[appState.pools.activeComboIndex];

&#x20; appState.pools.activeComboIndex++;

&#x20; return currentCombo;

}

Operational Target C: Core Engine Core Progression Loop

JavaScript

function handleEngineCoreTick() {

&#x20; appState.engine.elapsedPhaseSeconds--;

&#x20; appState.engine.elapsedTotalSeconds++;



&#x20; if (appState.engine.phase === 'WORK') {

&#x20;   appState.engine.workSecondsGlobal++;

&#x20;   

&#x20;   // Dynamic Combination Shift Controller

&#x20;   if (appState.engine.workSecondsGlobal > 180) {

&#x20;     if (appState.engine.elapsedPhaseSeconds % 60 === 0 \&\& appState.engine.elapsedPhaseSeconds > 0) {

&#x20;       triggerLocalAudioSignal('minute');

&#x20;       renderActiveCombinationDisplay();

&#x20;     }

&#x20;   }

&#x20; }



&#x20; // Final Sequence Warning Signal Ticker

&#x20; if (appState.engine.elapsedPhaseSeconds === 10) {

&#x20;   triggerLocalAudioSignal('countdown');

&#x20; }



&#x20; if (appState.engine.elapsedPhaseSeconds <= 0) {

&#x20;   transitionWorkoutLifecyclePhase();

&#x20; }



&#x20; updateDomInterfaceElements();

}

