import WaveformDisplay from './display/waveform.js';
import SpectrumDisplay from './display/spectrum.js';
import VolumeMeter from './display/volume-meter.js';

export default class Display {
    constructor(audioContext, analyser) {
        this.audioContext = audioContext;
        this.analyser = analyser;
        
        // Initialize display modules
        this.displays = {
            waveform: new WaveformDisplay(audioContext, analyser),
            spectrum: new SpectrumDisplay(audioContext, analyser),
            volumeMeter: new VolumeMeter(audioContext, analyser)
        };
        
        // Display settings
        this.settings = {
            waveform: {
                waveformColor: '#00ff88',
                lineWidth: 2
            },
            spectrum: {
                colorMode: 'frequency',
                baseColor: '#ff6600',
                smoothing: 0.8
            },
            volumeMeter: {
                smoothing: 0.3,
                peakHoldDuration: 1000
            }
        };
        
        // Animation control
        this.isRunning = false;
        this.animationFrame = null;
        
        this.startVisualization();
    }

    startVisualization() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        const draw = () => {
            if (!this.isRunning) return;
            
            this.animationFrame = requestAnimationFrame(draw);
            
            // Draw all displays
            this.displays.waveform.draw();
            this.displays.spectrum.draw();
            this.displays.volumeMeter.draw();
        };
        
        draw();
    }

    stopVisualization() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    // Update settings for individual displays
    updateDisplaySettings(displayType, settings) {
        if (this.displays[displayType]) {
            this.displays[displayType].updateSettings(settings);
            
            // Update internal settings
            if (this.settings[displayType]) {
                Object.assign(this.settings[displayType], settings);
            }
        }
    }

    // Update all display settings
    updateSettings(settings) {
        Object.entries(settings).forEach(([displayType, displaySettings]) => {
            this.updateDisplaySettings(displayType, displaySettings);
        });
    }

    // Get current settings
    getSettings() {
        return {
            ...this.settings
        };
    }

    // Reset all displays
    reset() {
        if (this.displays.volumeMeter.reset) {
            this.displays.volumeMeter.reset();
        }
    }

    // Toggle individual displays
    toggleDisplay(displayType, enabled) {
        const display = this.displays[displayType];
        if (!display) return;
        
        if (enabled) {
            // Show display element
            const element = this.getDisplayElement(displayType);
            if (element) {
                element.style.display = '';
            }
        } else {
            // Hide display element
            const element = this.getDisplayElement(displayType);
            if (element) {
                element.style.display = 'none';
            }
        }
    }

    getDisplayElement(displayType) {
        switch (displayType) {
            case 'waveform':
                return document.getElementById('waveform');
            case 'spectrum':
                return document.getElementById('spectrum');
            case 'volumeMeter':
                return document.querySelector('.volume-meter');
            default:
                return null;
        }
    }

    // Cleanup method
    destroy() {
        this.stopVisualization();
        
        // Destroy individual displays
        Object.values(this.displays).forEach(display => {
            if (display.destroy) {
                display.destroy();
            }
        });
    }
}