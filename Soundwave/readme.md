# 🎛️ FARSASYNTH.ai - Web-Based Audio AI Workstation

FARSASYNTH is an interactive, browser-based Digital Audio Workstation (DAW) that bridges the gap between Computer Vision and Audio Synthesis. Built entirely with Vanilla JavaScript, it allows users to play virtual instruments using AI hand-gesture tracking and manipulate digital signal processing (DSP) in real-time.

## 🚀 Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (MVC Architecture Pattern)
- **Computer Vision:** MediaPipe Hands AI (Real-time gesture tracking)
- **Audio Synthesis:** Tone.js (Web Audio API)

## 💡 Key Features
1. **🎸 Gesture Jam:** A real-time AI hand-tracking module that translates physical finger gestures into musical chords (Piano, Guitar, and Synth).
2. **🎹 VPiano:** An interactive virtual keyboard for chord training, playable via mouse or QWERTY keyboard.
3. **🎙️ Audio Lab:** A live studio environment with a real-time waveform visualizer and adjustable DSP effects (Reverb, Delay, Distortion) supporting both Live Mic and Loop inputs.
4. **🕹️ Groovebox (Mini DAW):** An 8-step sequencer matrix equipped with a custom drum kit (Kick, Snare, Hi-Hat) and a Synth tracker, synchronized flawlessly using `Tone.Transport`.

## ⚙️ How to Run Locally
Since FARSASYNTH is a pure frontend application without complex build tools:
1. Clone this repository.
2. Open `Index.html` directly in any modern browser (Google Chrome or Microsoft Edge recommended for Web Audio API support).
3. Allow Microphone and Camera permissions when prompted to fully experience the Gesture Jam and Audio Lab modules...
