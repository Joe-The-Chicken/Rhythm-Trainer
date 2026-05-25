import { settings } from "./settings.js";
import { SONG } from "./generate-song.js";

export var countingIn = false;
export var currentBeat = 0
export var currentMeasure = 0;
export var tempoModulation = 1;
export var isPlaying = false;

const beat = new Audio("media/beat.wav");
const soft_beat = new Audio("media/beat.wav");
const accent = new Audio("media/accent.wav");
const snare = new Audio("media/snare.ogg");

soft_beat.volume = 0.15;

[beat, soft_beat, accent, snare].forEach(audio => {
    audio.preload = "auto";
    audio.load();
});

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

let animationFrame;
let nextBeatTime = 0;

export function startMetronome() {
    isPlaying = true;
    countingIn = true;

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;

    currentBeat = 0;

    nextBeatTime = performance.now();

    scheduler();
}

export function pauseMetronome() {
    if (!isPlaying) return;

    deselectNote(currentMeasure, getNoteAtBeat(currentMeasure, currentBeat / 32));
    isPlaying = false;
    countingIn = true;
    currentBeat = 0;

    cancelAnimationFrame(animationFrame);

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = false;
}

export function resetMetronome() {
    if(isPlaying) deselectNote(currentMeasure, getNoteAtBeat(currentMeasure, currentBeat / 32));
    cancelAnimationFrame(animationFrame);
    isPlaying = false;
    currentBeat = 0;
    currentMeasure = 0;

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
}

function scheduler() {
    if (!isPlaying) return;

    const now = performance.now();

    // Catch up if frame stutters
    while (now >= nextBeatTime) {
        playClick();

        const n32 = (60000 / settings.bpm) / 8;
        nextBeatTime += n32 * tempoModulation;
    }

    animationFrame = requestAnimationFrame(scheduler);
}

function playClick() {
    deselectNote(currentMeasure, getNoteAtBeat(currentMeasure, currentBeat / 32));

    const timeSignature = SONG[currentMeasure].timeSignature
    const ratio = timeSignature.top / timeSignature.bottom;
    currentBeat = currentBeat + 1;

    if (currentBeat / 32 > ratio) {
        currentBeat = 1;
        if(countingIn) {
            countingIn = false;
        } else {
            currentMeasure = currentMeasure + 1;
        }
    }  

    const accentPattern = chronologize(timeSignature.getAccentPattern());

    if(settings.metronomeAudio) {
        if (currentBeat === 1 && settings.accentFirstBeat && !countingIn) {
            accent.currentTime = 0;
            accent.play();
        } else if (accentPattern.includes((currentBeat - 1) / 32)) {
            beat.currentTime = 0;
            beat.play();
        } else if (currentBeat % (32 / 8) === 1) { // change in settings?
            soft_beat.currentTime = 0;
            soft_beat.play();
        }
    }

    if (currentMeasure >= SONG.length) {
        resetMetronome();
    } else {
        if(currentBeat === 1) tempoModulation *= SONG[currentMeasure].tempoModulation ? SONG[currentMeasure].tempoModulation : 1;
        if(settings.rhythmAudio && !countingIn) playNote(currentMeasure, currentBeat, accentPattern);
        if(!countingIn) {
            selectNote(currentMeasure, getNoteAtBeat(currentMeasure, currentBeat / 32));
        } else {
            selectNote(currentMeasure, getNoteAtBeat(currentMeasure, 0));
        }
    }
}

function chronologize(pattern) {
    var a = [0];
    if(pattern.length > 1) {
        for (let i = 0; i < pattern.length - 1; i++) {
            a.push(pattern[i] + a[i]);
        }
    }
    return a;
}

function getNoteAtBeat(measure, beat, play=false) {
    if(measure >= SONG.length) return null;
    let t = 0;
    let i = 0;
    for(const note of SONG[measure].track) {
        if(t <= beat && beat < t + note.length) {
            return i;
        }
        t += note.length;
        i++;
    }
}

function selectNote(measure, num) {
    const noteEls = document.getElementsByClassName(`abcjs-n${num}`);
    for (let j = 0; j < noteEls.length; j++) {
        if (noteEls[j].classList.contains(`abcjs-mm${measure}`)) {
            noteEls[j].classList.add("selectedNote");
        }
    }
}

function deselectNote(measure, num) {
    const noteEls = document.getElementsByClassName(`abcjs-n${num}`);
    for (let j = 0; j < noteEls.length; j++) {
        if (noteEls[j].classList.contains(`abcjs-mm${measure}`)) {
            noteEls[j].classList.remove("selectedNote");
        }
    }
}

function playNote(measure, beat, accentPattern) {
    if(measure >= SONG.length) return;
    const notes = SONG[measure].track;
    const noteLengths = notes.map(note => note.length);
    const cNoteLengths = chronologize(noteLengths);

    const time = (beat-1) / 32;

    if(cNoteLengths.includes(time) && !notes[cNoteLengths.indexOf(time)].rest) {
        if(accentPattern.includes((currentBeat - 1) / 32)) {
            snare.volume = 1;
        } else {
            snare.volume = 0.3;
        }
        snare.currentTime = 0;
        snare.play();
    }
}