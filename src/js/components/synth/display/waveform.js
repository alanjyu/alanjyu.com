export default class WaveformDisplay {
  constructor(audioContext, analyser) {
    this.audioContext = audioContext;
    this.analyser = analyser;
    this.canvas = document.getElementById('waveform');
    this.canvasCtx = this.canvas.getContext('2d');
    
    // Audio analysis data
    this.bufferLength = this.analyser.fftSize;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.triggerLevel = 128;
    this.triggerHysteresis = 4;
    
    // Visual settings - theme-aware
    this.lineWidth = 2;
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
        // Get waveform data (time domain)
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        // Clear canvas
        const rect = this.canvas.getBoundingClientRect();
        this.canvasCtx.clearRect(0, 0, rect.width, rect.height);
        
        // Draw waveform
        this.canvasCtx.lineWidth = this.lineWidth;
        this.canvasCtx.strokeStyle = this.waveformColor;
        this.canvasCtx.lineJoin = 'round';
        this.canvasCtx.lineCap = 'round';
        this.canvasCtx.beginPath();
        
        const startIndex = this.findTriggerIndex();
        const sliceWidth = rect.width / (this.bufferLength - 1);
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const sampleIndex = (startIndex + i) % this.bufferLength;
            const v = (this.dataArray[sampleIndex] - 128) / 128;
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

    findTriggerIndex() {
        const maxIndex = this.bufferLength - 1;

        for (let i = 1; i < maxIndex; i++) {
            const previous = this.dataArray[i - 1];
            const current = this.dataArray[i];

            const crossedUpward =
                previous < this.triggerLevel - this.triggerHysteresis &&
                current >= this.triggerLevel + this.triggerHysteresis;

            if (crossedUpward) {
                return i;
            }
        }

        return 0;
    }

    updateSettings(settings) {
        if (settings.waveformColor) {
            this.waveformColor = settings.waveformColor;
        }
        if (settings.lineWidth) {
            this.lineWidth = settings.lineWidth;
        }
    }
}