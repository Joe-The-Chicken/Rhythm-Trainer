import { setWeightOfTS, timeSignaturesWeight } from "./time-signature.js";
import { setWeightOfPattern, patternWeight } from "./generate-pattern.js";
import { timeSignatures } from "./time-signature.js";
import patterns from "./patterns.json" with { type: "json" };
import { convertPatternToABC } from "./abcConvert.js";

export var settings = {
    "bpm": null,
    "line": null,
    "timeSignatures" : null,
    "patterns" : null
}

export function getSettings() {
    return settings;
}

export function updateSettings(s) {
    settings = s;
    setWeightOfPattern(settings.patterns);
    setWeightOfTS(settings.timeSignatures);
}

export function initSettings() {
    updateSettings({
        "bpm": 120,
        "line": 4,
        "timeSignatures" : [
            5,5,10,0,0,
            0,0,0,0,
            0,0,0,0,0,0
        ],
        "patterns" : {
            "0.25": [
                10, // rest
                20,20, // default
                5,5,5,5,5, // fast
                5,5,5,5,5 // syncopated
            ],
            "0.375": [
                10, // rest
                20,5,5,5, // default
                5,5,5,5,5,5 // fast
            ],
            "0.5": [
                5, // rest
                15,5,5, // default
                5,5,5, // fast
                5,5,5,5 // syncopated
            ]
        },
        "halfnote_split": 0.8
    });

    loadSettingsMenu();
}

function loadSettingsMenu() {
    const bpmInput = document.getElementById("bpm-input");
    const bpmValue = document.getElementById("bpm-value");
    const tsContainer = document.getElementById("ts-container");
    const patternContainer = document.getElementById("pattern-container");

    bpmInput.value = settings.bpm;
    bpmValue.textContent = settings.bpm;

    bpmInput.oninput = () => {
        const newSettings = structuredClone(settings);
        newSettings.bpm = Number(bpmInput.value);
        bpmValue.textContent = bpmInput.value;
        updateSettings(newSettings);
    };

    const TS_ROWS = [5, 4, 6];

    tsContainer.innerHTML = "";
    let index = 0;

    TS_ROWS.forEach(rowSize => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "ts-row";

        for (let i = 0; i < rowSize; i++) {
            const ts = timeSignatures[index];

            const box = document.createElement("div");
            box.className = "ts-box";

            const label = document.createElement("div");
            label.className = "ts-label";
            label.textContent = ts.toString();

            const slider = document.createElement("input");
            slider.type = "range";
            slider.min = 0;
            slider.max = 10;
            slider.value = settings.timeSignatures[index];
            slider.className = "ts-slider";
            slider.dataset.index = index;

            if (Number(slider.value) === 0) {
                slider.classList.add("zero");
            } else {
                slider.classList.remove("zero");
            }

            slider.oninput = () => {
                const idx = Number(slider.dataset.index);
                let value = Number(slider.value);

                const existing = settings.timeSignatures.filter(v => v > 0).length;

                if (value == 0 && existing == 1 && settings.timeSignatures[idx] > 0) {
                    value = 1;
                    slider.value = 1;
                }

                if (value == 0) slider.classList.add("zero");
                else slider.classList.remove("zero");

                const newSettings = structuredClone(settings);
                newSettings.timeSignatures[idx] = value;
                updateSettings(newSettings);
            };

            box.appendChild(label);
            box.appendChild(slider);
            rowDiv.appendChild(box);

            index++;
        }

        tsContainer.appendChild(rowDiv);
    });

    const P_ROWS = [5, 4, 6];

    patternContainer.innerHTML = "";
    
    // Iterate through each pattern length (0.25, 0.375, 0.5)
    for (const length in patterns) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "pattern-row";
        
        const patternList = patterns[length];
        
        patternList.forEach((pattern, patternIndex) => {
            const box = document.createElement("div");
            box.className = "pattern-box";
            
            const previewContainer = document.createElement("div");
            previewContainer.className = "pattern-preview";
            previewContainer.id = `pattern-preview-${length}-${patternIndex}`;
            
            const slider = document.createElement("input");
            slider.type = "range";
            slider.min = 0;
            slider.max = 50;
            slider.value = settings.patterns[length][patternIndex];
            slider.className = "pattern-slider";
            slider.dataset.length = length;
            slider.dataset.index = patternIndex;

            slider.oninput = () => {
                const len = slider.dataset.length;
                const idx = Number(slider.dataset.index);
                const value = Number(slider.value);
                
                const newSettings = structuredClone(settings);
                newSettings.patterns[len][idx] = value;
                updateSettings(newSettings);
            };
            
            box.appendChild(previewContainer);
            box.appendChild(slider);
            rowDiv.appendChild(box);
            
            // Render pattern with ABCJS after DOM is ready
            setTimeout(() => {
                renderPatternPreview(length, pattern, `pattern-preview-${length}-${patternIndex}`);
            }, 0);
        });
        
        patternContainer.appendChild(rowDiv);
    }

    document.querySelectorAll(".dropdown-header").forEach(header => {
        header.onclick = () => {
            const content = header.nextElementSibling;
            const isOpen = content.style.maxHeight;

            if (!isOpen || isOpen === "0px") {
                content.style.maxHeight = content.scrollHeight + "px";
                content.classList.add("open");
            } else {
                content.style.maxHeight = "0px";
                content.classList.remove("open");
            }
        };
    });
}

function renderPatternPreview(length, pattern, containerId) {
    // Convert pattern string to ABC notation
    console.log(pattern);
    const abc = `X:1\nK:C\nL:1/32\nM:${length*8}/8\n` + convertPatternToABC(pattern);
    console.log(abc);
    
    const settings_abc = {
        scale: 0.5,
        staffwidth: 40,
    };

    console.log(document.getElementById(containerId));

    window.ABCJS.renderAbc(containerId, abc, settings_abc);
}
