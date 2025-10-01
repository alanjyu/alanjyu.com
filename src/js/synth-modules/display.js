export default class Display {
    constructor(audioContext, analyser) {
        this.audioContext = audioContext;
        this.analyser = analyser;
        
        // Canvas setup
        this.canvas = document.getElementById('waveform');
        this.canvasCtx = this.canvas.getContext('2d');
        this.volumeFill = document.querySelector('.volume-fill');
        
        // Audio analysis data
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        this.setupCanvas();
        this.startVisualization();
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Handle canvas resize
        window.addEventListener('resize', () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
    }

    startVisualization() {
        const draw = () => {
            requestAnimationFrame(draw);
            
            // Get waveform data (time domain) instead of frequency data
            this.analyser.getByteTimeDomainData(this.dataArray);
            
            // Clear canvas
            const rect = this.canvas.getBoundingClientRect();
            this.canvasCtx.clearRect(0, 0, rect.width, rect.height);
            
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
            
            // Draw actual waveform
            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.strokeStyle = '#00ff88';
            this.canvasCtx.beginPath();
            
            const sliceWidth = rect.width / this.bufferLength;
            let x = 0;
            
            for (let i = 0; i < this.bufferLength; i++) {
                // Convert from 0-255 to -1 to 1, then to canvas coordinates
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
        };
        
        draw();
    }

    // Method to update display settings if needed
    updateSettings(settings) {
        // Could be used for display preferences, themes, etc.
        if (settings.waveformColor) {
            this.waveformColor = settings.waveformColor;
        }
    }
}