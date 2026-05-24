import { startMetronome, pauseMetronome, resetMetronome } from "./metronome.js";
import { loadSong } from "./generate-song.js";
import { loadSettings, resetSettings, saveSettings } from "./settings.js";

export function initButtons() {
    resetMetronome();
    document.getElementById("start").addEventListener("click", startMetronome);
    document.getElementById("pause").addEventListener("click", pauseMetronome);
    document.getElementById("reset").addEventListener("click", resetMetronome);
    document.getElementById("new").addEventListener("click", loadSong);
    document.getElementById("settings").addEventListener("click", () => {
        document.body.classList.toggle("settings-open");
    });

    document.getElementById("reset-settings").addEventListener("click", resetSettings);
    document.getElementById("save").addEventListener("click", saveSettings);
    document.getElementById("load").addEventListener("click", loadSettings);
}