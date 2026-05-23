import { initSettings, getSettings } from "./settings.js";
import { loadSong, SONG } from "./generate-song.js";
import { initButtons } from "./buttons.js";

initSettings();
initButtons();
loadSong();

window.settings = () => {return getSettings()};
window.song = () => {return SONG};