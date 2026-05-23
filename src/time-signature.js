import accent_patterns from './accent-patterns.json' with { type: 'json' };
import generation_roots from "./generation-roots.json" with { type: 'json' };

export class TimeSignature {
    constructor(text) {
        this.top = parseInt(text.split("/")[0]);
        this.bottom = parseInt(text.split("/")[1]);
    }

    getAccentPattern() {
        return accent_patterns[this.toString()];
    }

    getGenerationRoot() {
        return generation_roots[this.toString()];
    }

    getLength() {
        return this.top / this.bottom;
    }

    toString() {
        return this.top + "/" + this.bottom;
    }
}

export const timeSignatures = [
    new TimeSignature("2/4"),
    new TimeSignature("3/4"),
    new TimeSignature("4/4"),
    new TimeSignature("6/4"),
    new TimeSignature("8/8"),
    new TimeSignature("3/8"),
    new TimeSignature("6/8"),
    new TimeSignature("9/8"),
    new TimeSignature("12/8"),
    new TimeSignature("5/4"),
    new TimeSignature("7/4"),
    new TimeSignature("5/8"),
    new TimeSignature("7/8"),
    new TimeSignature("11/8"),
    new TimeSignature("15/8")
]

export var timeSignaturesWeight = [];

export function setWeightOfTS(val) {
    timeSignaturesWeight = val;
}

function getTotalWeight() {
    let total = 0;
    for(const weight of timeSignaturesWeight) {
        total += weight;
    }
    return total;
}

export function getRandomTimeSignature() {
    const random = Math.floor(Math.random() * getTotalWeight()) + 1;
    let sum = 0;

    for(let i = 0; i < timeSignaturesWeight.length; i++) {
        sum += timeSignaturesWeight[i];

        if(sum >= random) {
            return timeSignatures[i];
        }
    }
}