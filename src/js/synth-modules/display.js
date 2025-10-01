export default class Display {
    constructor(audioContext, analyser) {
        this.audioContext = audioContext;
        this.analyser = analyser;
        
        // Canvas setup for both waveform and spectrum
        this.canvas = document.getElementById('waveform');
        this.canvasCtx = this.canvas.getContext('2d');
        this.spectrumCanvas = document.getElementById('spectrum');
        this.spectrumCtx = this.spectrumCanvas.getContext('2d');
        this.volumeFill = document.querySelector('.volume-fill');
        
        // Audio analysis data
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        this.setupCanvas();
        this.startVisualization();
    }

    setupCanvas() {
        // Setup waveform canvas
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Setup spectrum canvas
        const spectrumRect = this.spectrumCanvas.getBoundingClientRect();
        this.spectrumCanvas.width = spectrumRect.width * window.devicePixelRatio;
        this.spectrumCanvas.height = spectrumRect.height * window.devicePixelRatio;
        this.spectrumCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Handle canvas resize
        window.addEventListener('resize', () => {
            // Resize waveform canvas
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
            
            // Resize spectrum canvas
            const spectrumRect = this.spectrumCanvas.getBoundingClientRect();
            this.spectrumCanvas.width = spectrumRect.width * window.devicePixelRatio;
            this.spectrumCanvas.height = spectrumRect.height * window.devicePixelRatio;
            this.spectrumCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
    }

    startVisualization() {
        const draw = () => {
            requestAnimationFrame(draw);
            
            // Draw both waveform and spectrum
            this.drawWaveform();
            this.drawSpectrum();
            this.updateVolumeMeter();
        };
        
        draw();
    }

    drawWaveform() {
        // Get waveform data (time domain)
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        // Clear canvas
        const rect = this.canvas.getBoundingClientRect();
        this.canvasCtx.clearRect(0, 0, rect.width, rect.height);
        
        // Draw waveform
        this.canvasCtx.lineWidth = 2;
        this.canvasCtx.strokeStyle = '#00ff88';
        this.canvasCtx.beginPath();
        
        const sliceWidth = rect.width / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = (this.dataArray[i] - 128) / 128;
            const y = (v * rect.height / 2) + (rect.height / 2);
            
            if (i === 0) {
                this.canvasCtx.moveTo(x, y);
            } else {
                this.canvasCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.canvasCtx.stroke();
    }

    drawSpectrum() {
        const canvas = this.spectrumCanvas;
        const ctx = this.spectrumCtx;
        const rect = canvas.getBoundingClientRect();
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.analyser.getByteFrequencyData(dataArray);
        
        // Clear canvas with same background as waveform
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        const barWidth = rect.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * rect.height;
            
            // Color gradient based on frequency
            const hue = (i / bufferLength) * 120; // 0 = red, 120 = green
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            // Save the current transformation matrix
            ctx.save();
            
            // Translate to move the rectangle from bottom
            ctx.translate(0, rect.height - barHeight);
            
            // Draw the rectangle at the translated position
            ctx.fillRect(x, 0, barWidth, barHeight);
            
            // Restore the transformation matrix
            ctx.restore();
            
            x += barWidth;
        }
    }

    updateVolumeMeter() {
        // Calculate volume for volume meter (using frequency data)
        const frequencyData = new Uint8Array(this.bufferLength);
        this.analyser.getByteFrequencyData(frequencyData);
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += frequencyData[i];
        }
        const average = sum / this.bufferLength;
        const volumePercent = (average / 255) * 100;
        
        // Update mixer-style LED segments
        const segments = document.querySelectorAll('.volume-segment');
        const activeSegments = Math.floor((volumePercent / 100) * segments.length);
        
        segments.forEach((segment, index) => {
            if (index < activeSegments) {
                segment.classList.add('active');
            } else {
                segment.classList.remove('active');
            }
        });
        
        const volumePercentageElement = document.querySelector('.volume-percentage');
        if (volumePercentageElement) {
            volumePercentageElement.textContent = `${Math.round(volumePercent)}%`;
        }
    }

    // Method to update display settings if needed
    updateSettings(settings) {
        if (settings.waveformColor) {
            this.waveformColor = settings.waveformColor;
        }
    }
}