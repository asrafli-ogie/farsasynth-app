// File: js/audio.js
class AudioEngine {
    constructor() {
        this.isReady = false;

        // --- 1. ENGINE INSTRUMEN (Gesture Jam & VPiano) ---
        this.piano = new Tone.Sampler({
            urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => { this.isReady = true; }
        }).toDestination();

        this.guitar = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.1 }
        }).toDestination();

        this.synth = new Tone.PolySynth(Tone.FMSynth, {
            envelope: { attack: 0.1, decay: 0.2, sustain: 1, release: 1 }
        }).toDestination();

        this.activeSynth = this.piano; 

        // --- 2. ENGINE AUDIO LAB (Efek Studio) ---
        this.labDistortion = new Tone.Distortion(0);
        this.labDelay = new Tone.FeedbackDelay("8n", 0);
        this.labReverb = new Tone.Freeverb({ roomSize: 0, dampening: 3000 });
        this.analyser = new Tone.Analyser("waveform", 256); 

        this.mic = new Tone.UserMedia();
        this.mic.chain(this.labDistortion, this.labDelay, this.labReverb, this.analyser, Tone.Destination);

        this.testSynth = new Tone.Synth().chain(this.labDistortion, this.labDelay, this.labReverb, this.analyser, Tone.Destination);
        this.testSequence = new Tone.Sequence((time, note) => {
            this.testSynth.triggerAttackRelease(note, "16n", time);
        }, ["C4", "E4", "G4", "B4"], "4n");

        // --- 3. METRONOME ENGINE ---
        this.metroSynth = new Tone.MembraneSynth().toDestination();
        this.metroLoop = new Tone.Loop((time) => {
            this.metroSynth.triggerAttackRelease("C2", "8n", time);
        }, "4n");

        // --- 4. GROOVEBOX DRUM KIT ---
        this.kick = new Tone.MembraneSynth().toDestination();
        this.snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
        }).toDestination();
        this.hihat = new Tone.MetalSynth({
            frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
        }).toDestination();
    }

    async startEngine() {
        await Tone.start();
        console.log("Audio Context aktif.");
    }

    setInstrument(jenis) {
        this.activeSynth.releaseAll(); 
        if (jenis === 'piano') this.activeSynth = this.piano;
        else if (jenis === 'guitar') this.activeSynth = this.guitar;
        else if (jenis === 'synth') this.activeSynth = this.synth;
    }

    playChord(chordArray) {
        if (this.isReady) {
            this.activeSynth.releaseAll(); 
            this.activeSynth.triggerAttack(chordArray);
        }
    }

    playNote(note) {
        if (this.isReady) {
            this.activeSynth.triggerAttackRelease(note, "8n");
        }
    }

    setMasterVolume(value) {
        if (value <= 0) {
            Tone.Destination.mute = true;
        } else {
            Tone.Destination.mute = false;
            Tone.Destination.volume.value = (value - 100) / 2; 
        }
    }

    stopAll() {
        this.piano.releaseAll();
        this.guitar.releaseAll();
        this.synth.releaseAll();
        
        if (this.mic.state === "started") this.mic.close();
        if (this.testSequence.state === "started") this.testSequence.stop();
        Tone.Transport.stop();
    }
}