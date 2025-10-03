export default class SpectrumDisplay {
    constructor(audioContext, analyser) {
        this.audioContext = audioContext;
        this.analyser = analyser;
        this.canvas = document.getElementById('spectrum');
        this.canvasCtx = this.canvas.getContext('2d');
        
        // Audio analysis data
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        // Visual settings
        this.colorMode = 'frequency'; // 'frequency', 'amplitude', 'solid'
        this.baseColor = '#ff6600';
        this.smoothing = 0.8;
        
        // Smoothing array for bars
        this.smoothedData = new Array(this.bufferLength).fill(0);
        
        this.setupCanvas();
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
        const ctx = this.canvasCtx;
        const rect = this.canvas.getBoundingClientRect();
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Apply smoothing
        for (let i = 0; i < this.bufferLength; i++) {
            this.smoothedData[i] = this.smoothedData[i] * this.smoothing + 
                                   this.dataArray[i] * (1 - this.smoothing);
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        const barWidth = rect.width / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.smoothedData[i] / 255) * rect.height;
            
            // Set color based on color mode
            ctx.fillStyle = this.getBarColor(i, this.smoothedData[i]);
            
            // Draw bar from bottom up
            ctx.fillRect(x, rect.height - barHeight, barWidth - 1, barHeight);
            
            x += barWidth;
        }
    }

    getBarColor(index, value) {
        switch (this.colorMode) {
            case 'frequency':
                // Color gradient based on frequency (red to green)
                const hue = (index / this.bufferLength) * 120;
                return `hsl(${hue}, 100%, 50%)`;
                
            case 'amplitude':
                // Color based on amplitude (dark to bright)
                const brightness = (value / 255) * 100;
                return `hsl(30, 100%, ${Math.max(20, brightness)}%)`;
                
            case 'solid':
            default:
                return this.baseColor;
        }
    }

    updateSettings(settings) {
        if (settings.colorMode) {
            this.colorMode = settings.colorMode;
        }
        if (settings.baseColor) {
            this.baseColor = settings.baseColor;
        }
        if (settings.smoothing !== undefined) {
            this.smoothing = Math.max(0, Math.min(1, settings.smoothing));
        }
    }

    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
    }
}