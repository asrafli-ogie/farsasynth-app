// File: js/app.js

const databaseChord = {
    "C": { major: ["C4", "E4", "G4"], minor: ["C4", "Eb4", "G4"] },
    "D": { major: ["D4", "F#4", "A4"], minor: ["D4", "F4", "A4"] },
    "E": { major: ["E4", "G#4", "B4"], minor: ["E4", "G4", "B4"] },
    "F": { major: ["F4", "A4", "C5"], minor: ["F4", "Ab4", "C5"] },
    "G": { major: ["G3", "B3", "D4"], minor: ["G3", "Bb3", "D4"] },
    "A": { major: ["A3", "C#4", "E4"], minor: ["A3", "C4", "E4"] },
    "B": { major: ["B3", "D#4", "F#4"], minor: ["B3", "D4", "F#4"] }
};

let chordTerakhir = []; 

// --- ELEMEN DOM UTAMA ---
const uiChordName = document.getElementById('uiChordName');
const menuCards = document.querySelectorAll('.card');
const gridMenu = document.getElementById('mainMenu');
const heroSection = document.querySelector('.hero');
const workspace = document.getElementById('workspace');
const btnBack = document.getElementById('btnBack');

const pianoWorkspace = document.getElementById('pianoWorkspace');
const btnBackPiano = document.getElementById('btnBackPiano');
const pianoKeys = document.querySelectorAll('.piano-key');

const audioLabWorkspace = document.getElementById('audioLabWorkspace');
const btnBackLab = document.getElementById('btnBackLab');

const grooveboxWorkspace = document.getElementById('grooveboxWorkspace');
const btnBackGroove = document.getElementById('btnBackGroove');

// --- INISIALISASI MESIN ---
const audio = new AudioEngine();
const tracker = new HandTracker(handleChordDetected); 

// --- ROUTING MENU (NAVIGASI) ---
menuCards.forEach(card => {
    card.addEventListener('click', async () => {
        await audio.startEngine();
        const namaMenu = card.querySelector('h3').innerText;
        
        gridMenu.style.display = 'none';
        heroSection.style.display = 'none';

        if (namaMenu === 'Gesture Jam') {
            workspace.style.display = 'block';
            await tracker.startCamera();
        } else if (namaMenu === 'VPiano') {
            pianoWorkspace.style.display = 'block';
        } else if (namaMenu === 'Audio Lab') {
            audioLabWorkspace.style.display = 'block';
        } else if (namaMenu === 'Groovebox') {
            grooveboxWorkspace.style.display = 'block';
        } else {
            alert("Sabar, modul " + namaMenu + " belum kita bangun!");
            gridMenu.style.display = 'grid';
            heroSection.style.display = 'block';
        }
    });
});

// --- TOMBOL KEMBALI ---
btnBack.addEventListener('click', () => {
    audio.stopAll(); 
    tracker.stopCamera();     
    uiChordName.innerText = "-"; 
    workspace.style.display = 'none';
    gridMenu.style.display = 'grid';
    heroSection.style.display = 'block';
});

btnBackPiano.addEventListener('click', () => {
    audio.stopAll();
    pianoWorkspace.style.display = 'none';
    gridMenu.style.display = 'grid';
    heroSection.style.display = 'block';
});

btnBackLab.addEventListener('click', () => {
    audio.stopAll();
    if(isMicOn) btnMic.click(); 
    if(isLoopOn) btnLoop.click(); 
    audioLabWorkspace.style.display = 'none';
    gridMenu.style.display = 'grid';
    heroSection.style.display = 'block';
});

btnBackGroove.addEventListener('click', () => {
    if (isGroovePlaying) btnPlayGroove.click(); // Matikan lagu jika sedang main
    grooveboxWorkspace.style.display = 'none';
    gridMenu.style.display = 'grid';
    heroSection.style.display = 'block';
});

// --- LOGIKA GESTURE AI & KAMERA ---
const instButtons = document.querySelectorAll('.inst-btn');
instButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        instButtons.forEach(b => {
            b.style.background = 'transparent';
            b.style.borderColor = 'var(--border-color)';
        });
        btn.style.background = 'var(--neon-purple)';
        btn.style.borderColor = 'var(--neon-purple)';
        audio.setInstrument(btn.getAttribute('data-inst'));
    });
});

function handleChordDetected(kunciDasar, jenisChord) {
    let chordSekarang = [];
    let namaLabel = "-";
    if (kunciDasar !== "") {
        chordSekarang = databaseChord[kunciDasar][jenisChord];
        namaLabel = kunciDasar + (jenisChord === "minor" ? "m" : "");
    }
    if (JSON.stringify(chordSekarang) !== JSON.stringify(chordTerakhir)) {
        if (chordSekarang.length > 0) {
            audio.playChord(chordSekarang);
            uiChordName.innerText = namaLabel; 
            uiChordName.style.color = jenisChord === "major" ? "#34d399" : "#fcd34d";
        } else {
            audio.piano.releaseAll();
            audio.guitar.releaseAll();
            audio.synth.releaseAll();
            uiChordName.innerText = "-"; 
        }
        chordTerakhir = chordSekarang;
    }
}

// --- LOGIKA VIRTUAL PIANO ---
pianoKeys.forEach(key => {
    key.addEventListener('mousedown', () => { audio.playNote(key.getAttribute('data-note')); });
});

const keyMap = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4',
    't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4', 'k': 'C5'
};

document.addEventListener('keydown', (e) => {
    if (pianoWorkspace.style.display === 'none') return; 
    const note = keyMap[e.key.toLowerCase()];
    if (note) {
        const keyElement = document.querySelector(`.piano-key[data-key="${e.key.toLowerCase()}"]`);
        if (keyElement && !keyElement.classList.contains('active')) {
            keyElement.classList.add('active'); 
            audio.playNote(note); 
        }
    }
});
document.addEventListener('keyup', (e) => {
    if (pianoWorkspace.style.display === 'none') return;
    const keyElement = document.querySelector(`.piano-key[data-key="${e.key.toLowerCase()}"]`);
    if (keyElement) keyElement.classList.remove('active'); 
});

// --- LOGIKA AUDIO LAB & VISUALIZER ---
const btnMic = document.getElementById('btnMic');
const btnLoop = document.getElementById('btnLoop');
const canvasVis = document.getElementById('visualizerCanvas');
let ctxVis = null;
if(canvasVis) ctxVis = canvasVis.getContext('2d');

let isMicOn = false;
let isLoopOn = false;
let animationFrameId;

if (document.getElementById('revSlider')) {
    document.getElementById('revSlider').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('revValue').innerText = Math.round(val * 100) + "%";
        audio.labReverb.roomSize.value = val; 
    });
    document.getElementById('delSlider').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('delValue').innerText = Math.round(val * 100) + "%";
        audio.labDelay.feedback.value = val * 0.8; 
    });
    document.getElementById('distSlider').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('distValue').innerText = Math.round(val * 100) + "%";
        audio.labDistortion.distortion = val;
    });
}

if (btnMic) {
    btnMic.addEventListener('click', async () => {
        await audio.startEngine();
        if (!isMicOn) {
            await audio.mic.open();
            isMicOn = true;
            btnMic.innerText = "🎤 Live Mic : ON";
            btnMic.style.color = "var(--neon-green)";
            btnMic.style.borderColor = "var(--neon-green)";
            drawVisualizer(); 
        } else {
            audio.mic.close();
            isMicOn = false;
            btnMic.innerText = "🎤 Live Mic : OFF";
            btnMic.style.color = "var(--text-main)";
            btnMic.style.borderColor = "var(--border-color)";
        }
    });
}

if (btnLoop) {
    btnLoop.addEventListener('click', async () => {
        await audio.startEngine();
        if (!isLoopOn) {
            Tone.Transport.start();
            audio.testSequence.start(0);
            isLoopOn = true;
            btnLoop.innerText = "🎵 Test Loop : ON";
            btnLoop.style.color = "var(--neon-purple)";
            btnLoop.style.borderColor = "var(--neon-purple)";
            drawVisualizer();
        } else {
            audio.testSequence.stop();
            isLoopOn = false;
            btnLoop.innerText = "🎵 Test Loop : OFF";
            btnLoop.style.color = "var(--text-main)";
            btnLoop.style.borderColor = "var(--border-color)";
        }
    });
}

function drawVisualizer() {
    if (!isMicOn && !isLoopOn) {
        cancelAnimationFrame(animationFrameId);
        ctxVis.clearRect(0, 0, canvasVis.width, canvasVis.height);
        return;
    }
    animationFrameId = requestAnimationFrame(drawVisualizer);
    const waveform = audio.analyser.getValue();
    ctxVis.clearRect(0, 0, canvasVis.width, canvasVis.height);
    ctxVis.beginPath();
    ctxVis.lineJoin = "round";
    ctxVis.lineWidth = 3;
    ctxVis.strokeStyle = "#34d399"; 
    const sensitivitas = 3.5; 
    for (let i = 0; i < waveform.length; i++) {
        const x = (i / waveform.length) * canvasVis.width;
        let titikY = waveform[i] * sensitivitas;
        if (titikY > 1) titikY = 1;
        if (titikY < -1) titikY = -1;
        const y = (titikY * (canvasVis.height / 2)) + (canvasVis.height / 2);
        if (i === 0) ctxVis.moveTo(x, y);
        else ctxVis.lineTo(x, y);
    }
    ctxVis.stroke();
}

// --- LOGIKA MASTER VOLUME & METRONOME ---
const masterVolume = document.getElementById('masterVolume');
const bpmSlider = document.getElementById('bpmSlider');
const bpmLabel = document.getElementById('bpmLabel');
const btnMetro = document.getElementById('btnMetro');
let isMetroOn = false;

if (masterVolume) {
    masterVolume.addEventListener('input', (e) => {
        const nilaiVolume = parseInt(e.target.value);
        audio.setMasterVolume(nilaiVolume);
    });
}
if (bpmSlider) {
    bpmSlider.addEventListener('input', (e) => {
        const bpm = e.target.value;
        bpmLabel.innerText = bpm + " BPM";
        Tone.Transport.bpm.value = bpm; 
    });
}
if (btnMetro) {
    btnMetro.addEventListener('click', async () => {
        await audio.startEngine(); 
        if (!isMetroOn) {
            Tone.Transport.start(); 
            audio.metroLoop.start(0); 
            isMetroOn = true;
            btnMetro.innerText = "⏹ Stop";
            btnMetro.style.background = "var(--neon-purple)";
            btnMetro.style.borderColor = "var(--neon-purple)";
            btnMetro.style.color = "white";
        } else {
            audio.metroLoop.stop(); 
            isMetroOn = false;
            btnMetro.innerText = "▶ Play";
            btnMetro.style.background = "transparent";
            btnMetro.style.borderColor = "var(--border-color)";
            btnMetro.style.color = "var(--text-main)";
        }
    });
}

// ==========================================
// --- LOGIKA GROOVEBOX (MINI DAW) ---
// ==========================================
const stepButtons = document.querySelectorAll('.step-btn');
const btnPlayGroove = document.getElementById('btnPlayGroove');
const btnClearGroove = document.getElementById('btnClearGroove');
let isGroovePlaying = false;
let currentStep = 0;
let grooveLoop;

// Efek klik nyala/mati pada kotak
stepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
    });
});

// Tombol Clear All
btnClearGroove.addEventListener('click', () => {
    stepButtons.forEach(btn => btn.classList.remove('active'));
});

// Mesin Waktu Groovebox
if (btnPlayGroove) {
    btnPlayGroove.addEventListener('click', async () => {
        await audio.startEngine();
        
        if (!isGroovePlaying) {
            Tone.Transport.start();
            
            // Jadwalkan ketukan berulang setiap not 1/8 (8n)
            grooveLoop = Tone.Transport.scheduleRepeat((time) => {
                let stepIndex = currentStep % 8; // Reset ke 0 setelah 8 ketukan
                let tracks = document.querySelectorAll('.track');
                
                tracks.forEach(track => {
                    let inst = track.getAttribute('data-inst');
                    let buttons = track.querySelectorAll('.step-btn');
                    let btn = buttons[stepIndex];
                    
                    // Efek visual garis yang jalan menggunakan sinkronisasi draw
                    Tone.Draw.schedule(() => {
                        buttons.forEach(b => b.classList.remove('playing'));
                        btn.classList.add('playing');
                    }, time);

                    // Bunyikan instrumen jika kotak sedang aktif
                    if (btn.classList.contains('active')) {
                        if (inst === 'hihat') audio.hihat.triggerAttackRelease("32n", time);
                        if (inst === 'snare') audio.snare.triggerAttackRelease("16n", time);
                        if (inst === 'kick') audio.kick.triggerAttackRelease("C1", "8n", time);
                        if (inst === 'synth') {
                            // Mainkan C Major otomatis
                            audio.synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", time);
                        }
                    }
                });
                
                currentStep++;
            }, "8n");
            
            isGroovePlaying = true;
            btnPlayGroove.innerText = "⏹ Stop Sequence";
            btnPlayGroove.style.background = "#ef4444"; // Merah tanda jalan
            btnPlayGroove.style.borderColor = "#ef4444";
            btnPlayGroove.style.color = "white";
        } else {
            // Hentikan sequence
            Tone.Transport.clear(grooveLoop);
            isGroovePlaying = false;
            currentStep = 0;
            
            // Bersihkan sisa efek visual
            stepButtons.forEach(b => b.classList.remove('playing'));
            
            btnPlayGroove.innerText = "▶ Play Sequence";
            btnPlayGroove.style.background = "var(--neon-green)";
            btnPlayGroove.style.borderColor = "var(--neon-green)";
            btnPlayGroove.style.color = "#000";
        }
    });
}