import { Note } from "./note.js";
import { Measure } from "./measure.js";
import { getRandomTimeSignature } from "./time-signature.js";
import patterns from "./patterns.json" with { type: 'json' }
import { settings } from "./settings.js";

export function generatePattern(timeSignature) {
    const time = timeSignature || getRandomTimeSignature();
    const generationRoot = time.getGenerationRoot();
    const accentPattern = time.getAccentPattern();

    let pattern = time.toString() + "|";

    for (const l of generationRoot) {
        pattern += getRandomPattern(l);
        pattern += ",";
    }

    return {
        text: pattern.slice(0,-1),
        accentPattern: accentPattern
    }
}

function pickRandomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getTotalWeight(w) {
    let total = 0;
    for(const weight of w) {
        total += weight;
    }
    return total;
}

function pickRandomFromWeighted(array,weight) {
    const random = Math.floor(Math.random() * getTotalWeight(weight)) + 1;
    let sum = 0;

    for(let i = 0; i < weight.length; i++) {
        sum += weight[i];

        if(sum >= random) {
            return array[i];
        }
    }
}

function getRandomPattern(l,n=settings.halfnote_split,v=false) {
    if(Math.random() > n) {
        return v ? pickRandomFromWeighted(patterns[l],patternWeight[l]) : pickRandomFromWeighted(patterns[l],patternWeight[l]);
    } else {
        let a = "";
        let pa = pickRandomFrom(branches[l]);
        for(const p of pa) {
            a += getRandomPattern(p,0,true);
            a += ",";
        }

        return a.slice(0,-1);
    }
}

export var patternWeight = {
    "0.25": [],
    "0.375": [],
    "0.5": []
}

export function setWeightOfPattern(value) {
    patternWeight = value;
}

const branches = {
    "0.25": [
        ["0.25"]
    ],
    "0.375": [
        ["0.375"]
    ],
    "0.5": [
        ["0.25","0.25"]
    ]
}