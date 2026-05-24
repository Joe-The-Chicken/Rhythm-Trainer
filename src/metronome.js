import { settings } from "./settings.js";
import { SONG } from "./generate-song.js";

export var currentBeat = 0
export var currentMeasure = 0;
export var tempoModulation = 1;
export var isPlaying = false;

export function initSound() {
    //no clue
}

const beat = new Audio("media/beat.wav");
const soft_beat = new Audio("media/beat.wav"); soft_beat.volume = 0.15;
const accent = new Audio("media/accent.wav");
const snare = new Audio("media/snare.ogg");

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

let metronome;

export function startMetronome() {
    isPlaying = true;

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;

    const n32 = (60000 / settings.bpm) / 8;
    playClick(n32); 
}

export function pauseMetronome() {
    if (!isPlaying) return;
    isPlaying = false;
    clearInterval(metronome);

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = false;
}

export function resetMetronome() {
    if(isPlaying) deselectNote(currentMeasure, getNoteAtBeat(currentMeasure, currentBeat / 32));
    clearInterval(metronome);
    isPlaying = false;
    currentBeat = 0;
    currentMeasure = 0;

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
}

function playClick(n32) {
    deselectNote(currentMeasure, getNoteAtBeat(currentMeasure, currentBeat / 32));

    const timeSignature = SONG[currentMeasure].timeSignature
    const ratio = timeSignature.top / timeSignature.bottom;
    currentBeat = currentBeat + 1;

    if (currentBeat / 32 > ratio) {
        currentBeat = 1;
        currentMeasure = currentMeasure + 1;
    }  

    const accentPattern = chronologize(timeSignature.getAccentPattern());

    if(settings.metronomeAudio) {
        if (currentBeat === 1 && settings.accentFirstBeat) {
            accent.currentTime = 0;
            accent.play();
        } else if (accentPattern.includes((currentBeat - 1) / 32)) {
            beat.currentTime = 0;
            beat.play();
        } else if (currentBeat % (32 / timeSignature.bottom) === 1) {
            soft_beat.currentTime = 0;
            soft_beat.play();
        }
    }

    if(currentBeat === 1) {
        tempoModulation *= SONG[currentMeasure].tempoModulation ? SONG[currentMeasure].tempoModulation : 1;
    }

    if (currentMeasure >= SONG.length) {
        clearInterval(metronome);
        resetMetronome();
    } else {
        if(settings.rhythmAudio) playNote(currentMeasure, currentBeat);
        selectNote(currentMeasure, getNoteAtBeat(currentMeasure, currentBeat / 32, true));
        metronome = setTimeout(() => playClick(n32), n32 * tempoModulation);
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

function playNote(measure, beat) {
    if(measure >= SONG.length) return;
    const notes = SONG[measure].track;
    const noteLengths = notes.map(note => note.length);
    const cNoteLengths = chronologize(noteLengths);

    const time = (beat-1) / 32;

    if(cNoteLengths.includes(time) && !notes[cNoteLengths.indexOf(time)].rest) {
        snare.currentTime = 0;
        snare.play();
    }
}