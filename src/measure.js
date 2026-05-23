import { TimeSignature } from "./time-signature.js";
import { Note } from "./note.js";

export class Measure {

    constructor({ text, accentPattern }) {
        const parsed = Measure.parseString(text);
        this.track = parsed.track;
        this.timeSignature = parsed.timeSignature;
        this.accentPattern = accentPattern;
    }

    static parseString(text) {
        const components = text.split("|");
        const timeSignature = new TimeSignature(components[0]);

        const track = components[1]
            .split(",")
            .map(n => new Note(n));

        return {
            timeSignature,
            track
        };
    }

    static trackToString(track) {
        return track.map(n => n.toString()).join(",");
    }

    toString() {
        return this.timeSignature.toString() + "|" + Measure.trackToString(this.track);
    }
}
