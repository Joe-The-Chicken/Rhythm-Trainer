import { Measure } from "./measure.js";
import { generatePattern } from "./generate-pattern.js";
import { convertSongToABC } from "./abcConvert.js";
import { resetMetronome } from "./metronome.js";

export var SONG = [];

export function loadSong() {
    resetMetronome();

    SONG = [
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern()),
        new Measure(generatePattern())
    ];

    const ABC = convertSongToABC(SONG);
    const SETTINGS = () => { return {
        scale: 0.8, 
        staffwidth: window.innerWidth * 0.45,
        add_classes: true,
        selectionColor: "#000"
    } };

    var visual = window.ABCJS.renderAbc("container", ABC, SETTINGS());

    window.addEventListener('resize', () => {
        visual = window.ABCJS.renderAbc("container", ABC, SETTINGS());
    });
}