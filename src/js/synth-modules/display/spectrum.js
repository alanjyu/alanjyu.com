export default class SpectrumDisplay {
    constructor(audioContext, analyser) {
        this.audioContext = audioContext;
        this.analyser = analyser;
        this.canvas = document.getElementById('spectrum');
        this.canvasCtx = this.canvas.getContext('2d');
        
        // Audio analysis data
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        // Visual settings - theme-aware
        this.colorMode = 'frequency'; // 'frequency', 'amplitude', 'solid'
        this.updateThemeColors();
        this.smoothing = 0.8;
        
        // Smoothing array for bars
        this.smoothedData = new Array(this.bufferLength).fill(0);
        
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
            this.baseColor = '#ff6600'; // Orange for dark mode
            this.frequencyGradient = {
                start: '#ff0000', // Red
                end: '#00ff88'    // Green
            };
        } else {
            this.baseColor = '#8b4513'; // Brown for light mode
            this.frequencyGradient = {
                start: '#8b4513', // Brown
                end: '#ff8c00'    // Orange
            };
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
                // Color gradient based on frequency using theme colors
                const ratio = index / this.bufferLength;
                if (ratio < 0.5) {
                    // Interpolate from start to middle
                    const localRatio = ratio * 2;
                    return this.interpolateColor(this.frequencyGradient.start, this.baseColor, localRatio);
                } else {
                    // Interpolate from middle to end
                    const localRatio = (ratio - 0.5) * 2;
                    return this.interpolateColor(this.baseColor, this.frequencyGradient.end, localRatio);
                }
                
            case 'amplitude':
                // Color based on amplitude (dark to bright)
                const brightness = (value / 255) * 100;
                const theme = document.documentElement.getAttribute('data-theme') || 'light';
                if (theme === 'dark') {
                    return `hsl(30, 100%, ${Math.max(20, brightness)}%)`;
                } else {
                    return `hsl(30, 80%, ${Math.max(15, brightness * 0.6)}%)`;
                }
                
            case 'solid':
            default:
                return this.baseColor;
        }
    }

    /**
     * Interpolate between two hex colors
     */
    interpolateColor(color1, color2, ratio) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
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