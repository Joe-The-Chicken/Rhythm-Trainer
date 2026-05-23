import { startMetronome, pauseMetronome, resetMetronome } from "./metronome.js";
import { loadSong } from "./generate-song.js";

export function initButtons() {
    resetMetronome();
    document.getElementById("start").addEventListener("click", startMetronome);
    document.getElementById("pause").addEventListener("click", pauseMetronome);
    document.getElementById("reset").addEventListener("click", resetMetronome);
    document.getElementById("new").addEventListener("click", loadSong);
}