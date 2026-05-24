import { setWeightOfTS, timeSignaturesWeight } from "./time-signature.js";
import { setWeightOfPattern, patternWeight } from "./generate-pattern.js";
import { timeSignatures } from "./time-signature.js";
import patterns from "./patterns.json" with { type: "json" };
import { convertPatternToABC } from "./abcConvert.js";

const savedSettings = localStorage.getItem("rhythmTrainerSettings");

const defaultSettings = {
    "bpm": 120,
    "line": 4,
    "timeSignatures" : [
        5,5,10,0,0,
        0,0,0,0,
        0,0,0,0,0,0
    ],
    "patterns" : {
        "0.25": [
            5, // rest
            10,5, // default
            0,0,0,0,0, // fast
            0,0,0,0,0 // syncopated
        ],
        "0.375": [
            5, // rest
            10,5,5,5, // default
            0,0,0,0,0,0 // fast
        ],
        "0.5": [
            5, // rest
            10,5,5, // default
            0,0,0, // fast
            0,0,0,0 // syncopated
        ]
    },
    "halfnote_split": 0.8,
    "metronomeAudio": true,
    "rhythmAudio": true,
    "accentFirstBeat": true
}

export var settings = defaultSettings;

export function getSettings() {
    return settings;
}

export function updateSettings(s) {
    settings = s;
    setWeightOfPattern(settings.patterns);
    setWeightOfTS(settings.timeSignatures);
    localStorage.setItem("rhythmTrainerSettings", JSON.stringify(settings));
}

export function resetSettings() {
    let result = confirm("Are you sure you want to reset all settings to default? This cannot be undone.")

    if(!result) return;
            
    updateSettings(defaultSettings);
    loadSettingsMenu();
}

export function saveSettings() {
    const data = encodeURIComponent(JSON.stringify(settings));
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${Date.now()}.rtsv`;
    link.click();

    URL.revokeObjectURL(url);
}

export function loadSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.rtsv';
    input.click();

    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        file.text().then(text => {
            try {
                const data = JSON.parse(decodeURIComponent(text));
                console.log(data);
                updateSettings(data);
                loadSettingsMenu();
            } catch (error) {
                console.error("failed to parse data:", error);
            }
        });
    }
}

export function initSettings() {
    if(savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            updateSettings(parsedSettings);
        } catch (e) {
            console.error("Failed to parse saved settings, using default settings.", e);
            updateSettings(defaultSettings);
        }
    } else {
        updateSettings(defaultSettings);
    }
    loadSettingsMenu();
}

function loadSettingsMenu() {
    const bpmInput = document.getElementById("bpm-input");
    const bpmValue = document.getElementById("bpm-value");
    const bpmTitle = document.getElementById("bpm-title");
    const tsContainer = document.getElementById("ts-container");
    const patternContainer = document.getElementById("pattern-container");

    bpmInput.value = settings.bpm;
    bpmValue.textContent = settings.bpm;
    bpmTitle.textContent = getTempoLabel(settings.bpm);

    bpmInput.oninput = () => {
        const newSettings = structuredClone(settings);
        newSettings.bpm = Number(bpmInput.value);
        bpmValue.textContent = bpmInput.value;
        bpmTitle.textContent = getTempoLabel(bpmInput.value);
        updateSettings(newSettings);
    };

    const TS_ROWS = [5, 4, 6];
    tsContainer.innerHTML = "";
    
    let index = 0;
    TS_ROWS.forEach(rowSize => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "ts-row";

        for (let i = 0; i < rowSize; i++) {
            rowDiv.appendChild(renderTimeSignature(index, timeSignaturesWeight[index]));
            index++;
        }

        tsContainer.appendChild(rowDiv);
    });

    const P_ROWS = [
        5, 5, 3, 
        5, 5, 1,
        5, 5, 1
    ];
    patternContainer.innerHTML = "";
    
    const lengths = Object.keys(patterns);
    let length = 0;
    let patternIndex = 0;
    for (const count in P_ROWS) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "pattern-row";
        
        for(let i = 0; i < P_ROWS[count]; i++) {
            const thisLength = lengths[length];
            const thisPattern = patterns[thisLength][patternIndex];
            console.log(thisLength, thisPattern, patternIndex);

            const patternBox = renderPattern(thisLength, thisPattern, patternIndex);
            rowDiv.appendChild(patternBox);
            setTimeout(() => {
                renderPatternPreview(thisLength, thisPattern, patternBox.querySelector(".pattern-preview").id);
            }, 0);
            
            patternContainer.appendChild(rowDiv);
            patternIndex++;
            if(patternIndex == patterns[thisLength].length) {
                patternIndex = 0;
                length++;
            }
        }
    }

    const miscSettings = [
        { id: "metronome-audio", settingKey: "metronomeAudio" },
        { id: "rhythm-audio", settingKey: "rhythmAudio" },
        { id: "accent-first-beat", settingKey: "accentFirstBeat" }
    ];

    miscSettings.forEach(({ id, settingKey }) => {
        const checkbox = document.getElementById(id);
        checkbox.checked = settings[settingKey] || false;
        checkbox.onchange = () => {
            const newSettings = structuredClone(settings);
            newSettings[settingKey] = checkbox.checked;
            updateSettings(newSettings);
        }
    });

    document.querySelectorAll(".dropdown-header").forEach(header => {
        header.onclick = () => {
            const content = header.nextElementSibling;
            const isOpen = content.style.maxHeight;

            if (!isOpen || isOpen === "0px") {
                document.querySelectorAll(".dropdown-content.open").forEach(openContent => {
                    openContent.style.maxHeight = "0px";
                    openContent.classList.remove("open");
                });

                content.style.maxHeight = content.scrollHeight + "px";
                content.classList.add("open");
            } else {
                content.style.maxHeight = "0px";
                content.classList.remove("open");
            }
        };
    });
}

function getTempoLabel(bpm) {
    if(bpm <= 30) return "Grave";
    if(bpm <= 60) return "Largo";
    if(bpm <= 84) return "Adagio";
    if(bpm <= 108) return "Andante";
    if(bpm <= 120) return "Moderato";
    if(bpm <= 144) return "Allegro";
    if(bpm <= 180) return "Vivace";
    if(bpm <= 200) return "Presto";
    return "Prestissimo";
}

function renderTimeSignature(index, weight) {
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
    return box;
}

function renderPattern(length, pattern, patternIndex) {
    const box = document.createElement("div");
    box.className = "pattern-box";
    
    const previewContainer = document.createElement("div");
    previewContainer.className = "pattern-preview";
    previewContainer.id = `pattern-preview-${length}-${patternIndex}`;
    
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 10;
    slider.value = settings.patterns[length][patternIndex];
    slider.className = "pattern-slider";
    slider.dataset.length = length;
    slider.dataset.index = patternIndex;

    if (slider.value == 0) slider.classList.add("zero");
    else slider.classList.remove("zero");

    slider.oninput = () => {
        const len = slider.dataset.length;
        const idx = Number(slider.dataset.index);
        const value = Number(slider.value);

        if (value == 0) slider.classList.add("zero");
        else slider.classList.remove("zero");
        
        const newSettings = structuredClone(settings);
        newSettings.patterns[len][idx] = value;
        updateSettings(newSettings);
    };
    
    box.appendChild(previewContainer);
    box.appendChild(slider);
    return box;
}

function renderPatternPreview(length, pattern, containerId) {
    var signature = length == 0.25 ? "4/4" : length == 0.375 ? "6/8" : "2/2";
    const abc = `X:1\nK:C\nL:1/32\nM:${signature}\n` + convertPatternToABC(pattern);
    
    const settings_abc = {
        scale: window.innerWidth * 0.0005,
        staffwidth: 0.1
    };

    console.log(document.getElementById(containerId));

    window.ABCJS.renderAbc(containerId, abc, settings_abc);
}