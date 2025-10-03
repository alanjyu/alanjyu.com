export default class WaveformDisplay {
    constructor(audioContext, analyser) {
        this.audioContext = audioContext;
        this.analyser = analyser;
        this.canvas = document.getElementById('waveform');
        this.canvasCtx = this.canvas.getContext('2d');
        
        // Audio analysis data
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        // Visual settings - theme-aware
        this.updateThemeColors();
        this.lineWidth = 2;
        
        // Listen for theme changes
        this.setupThemeListener();
        
        this.setupCanvas();
    }

    /**
     * Detect current theme and set appropriate colors
     */
    updateThemeColors() {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        
        if (theme === 'dark') {
            this.waveformColor = '#00ff88'; // Green for dark mode
        } else {
            this.waveformColor = '#ff8c00'; // Orange for light mode
        }
    }

    /**
     * Listen for theme changes and update colors
     */
    setupThemeListener() {
        // Watch for theme attribute changes
        const observer = new MutationObserver(() => {
            this.updateThemeColors();
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Handle canvas resize
        this.resizeHandler = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        
        window.addEventListener('resize', this.resizeHandler);
    }

    draw() {
        // Get waveform data (time domain)
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        // Clear canvas
        const rect = this.canvas.getBoundingClientRect();
        this.canvasCtx.clearRect(0, 0, rect.width, rect.height);
        
        // Draw waveform
        this.canvasCtx.lineWidth = this.lineWidth;
        this.canvasCtx.strokeStyle = this.waveformColor;
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

    updateSettings(settings) {
        if (settings.waveformColor) {
            this.waveformColor = settings.waveformColor;
        }
        if (settings.lineWidth) {
            this.lineWidth = settings.lineWidth;
        }
    }

    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
    }
}