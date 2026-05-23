import { settings } from "./settings.js";
import { Note } from "./note.js";

export function convertSongToABC(song) {
    var text = "X:1\nK:C\nL:1/32\n";

    let m = 0;
    for(const measure of song) {
        if(m == 0) {
            text += `[M:${measure.timeSignature.toString()}]`
        } else if(measure.timeSignature.toString() != song[m - 1].timeSignature.toString()) {
            text += `|[M:${measure.timeSignature.toString()}]`
            if((m) % settings.line == 0) text+="\n";
        } else if((m) % settings.line == 0) {
            text += `|[M:${measure.timeSignature.toString()}]`
            text += "\n";
        }

        let i = 0;
        let totalLength = 0;
        for(const note of measure.track) {
            text += note.toABC();
            totalLength += note.length
            while(totalLength >= measure.accentPattern[i]) {
                totalLength -= measure.accentPattern[i];
                i++;
                text += " ";
            }
        }
        text += "|";
        if(m==song.length - 1) text += "]"

        m++;
    }
    console.log(text);
    return text;
}

export function convertPatternToABC(pattern) {
    let abc = ``;

    for (const note of pattern.split(",")) {
        abc += new Note(note).toABC();
    }
    abc += "|]";
    return abc;
}