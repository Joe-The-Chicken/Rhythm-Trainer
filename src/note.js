import noteSymbols from "./note-symbols.json" with { type: "json" }
import noteLengths from "./note-lengths.json" with { type: "json" }

export class Note {
    constructor(length=0.25, rest=false) {
        if(typeof length == "number") {
            this.length = length;
            this.rest = rest;
        } else if(typeof length == "string") {
            this.length = noteLengths[length.toLowerCase()];

            const isLowerCase = str => str === str.toLowerCase();
            this.rest = isLowerCase(length);
        }
    }

    toString() {
        if(this.rest) {
            return noteSymbols.rests[this.length.toString()];
        } else {
            return noteSymbols.notes[this.length.toString()];
        }
    }

    toABC() {
        return (this.rest ? "z" : "B") + 32*this.length;
    }
}