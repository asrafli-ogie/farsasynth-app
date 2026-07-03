// File: js/tracker.js
class HandTracker {
    constructor(onChordDetected) {
        this.video = document.getElementById('videoElement');
        this.canvas = document.getElementById('canvasElement');
        this.ctx = this.canvas.getContext('2d');
        this.onChordDetected = onChordDetected; 
        
        this.hands = new Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});
        
        this.hands.setOptions({
            maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6
        });
        
        this.hands.onResults((results) => this.onResults(results));
    }

    async startCamera() {
        this.camera = new Camera(this.video, {
            onFrame: async () => { await this.hands.send({image: this.video}); },
            width: 640, height: 480
        });
        await this.camera.start();
    }

    stopCamera() {
        if (this.camera) {
            this.camera.stop(); // Stop instance MediaPipe
        }
        if (this.video && this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop()); // Paksa matikan hardware webcam
            this.video.srcObject = null;
        }
        // Bersihkan kanvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    hitungJarak(titik1, titik2) {
        return Math.sqrt(Math.pow(titik1.x - titik2.x, 2) + Math.pow(titik1.y - titik2.y, 2));
    }

    onResults(results) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const titik = results.multiHandLandmarks[0];
            
            for (let i = 0; i < titik.length; i++) {
                this.ctx.beginPath();
                this.ctx.arc(titik[i].x * this.canvas.width, titik[i].y * this.canvas.height, 5, 0, 2 * Math.PI);
                this.ctx.fillStyle = "#34d399";
                this.ctx.fill();
            }
            
            // Deteksi Jari
            const telunjukBuka = titik[8].y < titik[6].y;
            const tengahBuka = titik[12].y < titik[10].y;
            const manisBuka = titik[16].y < titik[14].y;
            const kelingkingBuka = titik[20].y < titik[18].y;
            const jempolBuka = this.hitungJarak(titik[4], titik[17]) > (this.hitungJarak(titik[2], titik[17]) + 0.05);

            // Deteksi Rotasi (Major/Minor)
            const jarakY = Math.abs(titik[9].y - titik[0].y);
            const jarakX = Math.abs(titik[9].x - titik[0].x);
            const jenisChord = jarakX > jarakY ? "minor" : "major";

            let kunciDasar = "";
            if (jempolBuka && !telunjukBuka && !tengahBuka && !manisBuka && !kelingkingBuka) kunciDasar = "B"; 
            else if (!jempolBuka && telunjukBuka && !tengahBuka && !manisBuka && !kelingkingBuka) kunciDasar = "C"; 
            else if (!jempolBuka && telunjukBuka && tengahBuka && !manisBuka && !kelingkingBuka) kunciDasar = "D"; 
            else if (!jempolBuka && telunjukBuka && tengahBuka && manisBuka && !kelingkingBuka) kunciDasar = "E"; 
            else if (!jempolBuka && telunjukBuka && tengahBuka && manisBuka && kelingkingBuka) kunciDasar = "F"; 
            else if (jempolBuka && telunjukBuka && tengahBuka && manisBuka && kelingkingBuka) kunciDasar = "G"; 
            else if (jempolBuka && !telunjukBuka && !tengahBuka && !manisBuka && kelingkingBuka) kunciDasar = "A"; 

            if (this.onChordDetected) this.onChordDetected(kunciDasar, jenisChord);
        } else {
            if (this.onChordDetected) this.onChordDetected("", "");
        }
    }
}