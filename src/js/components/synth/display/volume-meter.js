export default class VolumeMeter {
    constructor(audioContext, analyser) {
        this.audioContext = audioContext;
        this.analyser = analyser;
        
        // DOM elements
        this.volumeFill = document.querySelector('.volume-fill');
        this.segments = document.querySelectorAll('.volume-segment');
        this.volumePercentageElement = document.querySelector('.volume-percentage');
        
        // Audio analysis data
        this.bufferLength = this.analyser.frequencyBinCount;
        this.frequencyData = new Uint8Array(this.bufferLength);
        
        // Volume calculation settings
        this.smoothing = 0.3;
        this.currentVolume = 0;
        this.peakHold = 0;
        this.peakHoldTime = 0;
        this.peakHoldDuration = 1000; // milliseconds
        
        // Segment thresholds (dB levels for each segment)
        this.segmentThresholds = [
            -60, -54, -48, -42, -36, -30, -24, -18, -12, -6, -3, 0
        ];
    }

    draw() {
        // Get frequency data for volume calculation
        this.analyser.getByteFrequencyData(this.frequencyData);
        
        // Calculate RMS volume
        const volume = this.calculateRMSVolume();
        
        // Apply smoothing
        this.currentVolume = this.currentVolume * this.smoothing + 
                           volume * (1 - this.smoothing);
        
        // Update peak hold
        if (volume > this.peakHold) {
            this.peakHold = volume;
            this.peakHoldTime = Date.now();
        } else if (Date.now() - this.peakHoldTime > this.peakHoldDuration) {
            this.peakHold *= 0.95; // Slowly decay peak
        }
        
        // Update visual elements
        this.updateSegments();
        this.updatePercentageDisplay();
    }

    calculateRMSVolume() {
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            const normalized = this.frequencyData[i] / 255;
            sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / this.bufferLength);
        
        // Convert to percentage (0-100) directly
        return rms * 100;
    }

    updateSegments() {
        if (!this.segments.length) return;
        
        // Calculate how many segments should be active based on volume percentage
        const totalSegments = this.segments.length;
        const activeSegmentCount = Math.floor((this.currentVolume / 100) * totalSegments);
        const peakSegmentIndex = Math.floor((this.peakHold / 100) * totalSegments);
        
        this.segments.forEach((segment, index) => {
            // Clear previous classes
            segment.classList.remove('active', 'peak', 'red', 'yellow', 'green');
            
            // Check if segment should be active (current level)
            if (index < activeSegmentCount) {
                segment.classList.add('active');
            }
            
            // Add peak indicator
            if (index === peakSegmentIndex && peakSegmentIndex >= activeSegmentCount) {
                segment.classList.add('peak');
            }
            
            // Color coding based on position in meter
            const segmentPosition = index / totalSegments;
            if (segmentPosition >= 0.85) {
                segment.classList.add('red');
            } else if (segmentPosition >= 0.7) {
                segment.classList.add('yellow');
            } else {
                segment.classList.add('green');
            }
        });
    }

    updatePercentageDisplay() {
        if (this.volumePercentageElement) {
            this.volumePercentageElement.textContent = `${Math.round(this.currentVolume)}%`;
        }
        
        // Update fill bar if present
        if (this.volumeFill) {
            this.volumeFill.style.height = `${this.currentVolume}%`;
        }
    }

    updateSettings(settings) {
        if (settings.smoothing !== undefined) {
            this.smoothing = Math.max(0, Math.min(1, settings.smoothing));
        }
        if (settings.peakHoldDuration !== undefined) {
            this.peakHoldDuration = Math.max(0, settings.peakHoldDuration);
        }
        if (settings.segmentThresholds && Array.isArray(settings.segmentThresholds)) {
            this.segmentThresholds = [...settings.segmentThresholds];
        }
    }

    reset() {
        this.currentVolume = 0;
        this.peakHold = 0;
        this.peakHoldTime = 0;
        
        // Clear all segments
        this.segments.forEach(segment => {
            segment.classList.remove('active', 'peak');
        });
        
        if (this.volumePercentageElement) {
            this.volumePercentageElement.textContent = '0%';
        }
        
        if (this.volumeFill) {
            this.volumeFill.style.height = '0%';
        }
    }
}