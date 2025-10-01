export default class Oscillator {
    constructor(audioContext, destinationNode) {
        this.audioContext = audioContext;
        this.destinationNode = destinationNode;
        this.activeOscillators = new Map();
        
        // Oscillator settings
        this.osc1Settings = {
            waveform: 'sawtooth',
            volume: 0.5
        };
        
        this.osc2Settings = {
            waveform: 'sine',
            volume: 0.3,
            detune: 0
        };
        
        this.initControls();
    }

    initControls() {
        // Oscillator 1 controls
        const osc1Waveform = document.getElementById('osc1-waveform');
        const osc1Volume = document.getElementById('osc1-volume');
        
        // Oscillator 2 controls
        const osc2Waveform = document.getElementById('osc2-waveform');
        const osc2Volume = document.getElementById('osc2-volume');
        const osc2Detune = document.getElementById('osc2-detune');

        // Event listeners for OSC1
        osc1Waveform?.addEventListener('change', (e) => {
            this.osc1Settings.waveform = e.target.value;
            this.updateActiveOscillators();
        });

        osc1Volume?.addEventListener('input', (e) => {
            this.osc1Settings.volume = e.target.value / 100;
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            this.updateActiveOscillators();
        });

        // Event listeners for OSC2
        osc2Waveform?.addEventListener('change', (e) => {
            this.osc2Settings.waveform = e.target.value;
            this.updateActiveOscillators();
        });

        osc2Volume?.addEventListener('input', (e) => {
            this.osc2Settings.volume = e.target.value / 100;
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            this.updateActiveOscillators();
        });

        osc2Detune?.addEventListener('input', (e) => {
            this.osc2Settings.detune = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${e.target.value} cents`;
            this.updateActiveOscillators();
        });
    }

    updateActiveOscillators() {
        // Update all currently playing oscillators with new settings
        this.activeOscillators.forEach(({ osc1, osc2, gain1, gain2 }, note) => {
            // Update waveforms
            osc1.type = this.osc1Settings.waveform;
            osc2.type = this.osc2Settings.waveform;
            
            // Update volumes
            gain1.gain.setValueAtTime(this.osc1Settings.volume * 0.3, this.audioContext.currentTime);
            gain2.gain.setValueAtTime(this.osc2Settings.volume * 0.3, this.audioContext.currentTime);
            
            // Update detune
            const frequency = 440 * Math.pow(2, (note - 69) / 12);
            osc2.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            osc2.detune.setValueAtTime(this.osc2Settings.detune, this.audioContext.currentTime);
        });
    }

    noteOn(note, velocity) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create two oscillators
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        
        // Create separate gain nodes for each oscillator
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        
        // Create a mixer gain node to combine both oscillators
        const mixerGain = this.audioContext.createGain();

        const frequency = 440 * Math.pow(2, (note - 69) / 12);
        
        // Configure oscillator 1
        osc1.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        osc1.type = this.osc1Settings.waveform;
        
        // Configure oscillator 2 with detune
        osc2.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        osc2.type = this.osc2Settings.waveform;
        osc2.detune.setValueAtTime(this.osc2Settings.detune, this.audioContext.currentTime);
        
        // Set volumes based on velocity and oscillator settings
        const baseVolume = (velocity / 127) * 0.3;
        gain1.gain.setValueAtTime(baseVolume * this.osc1Settings.volume, this.audioContext.currentTime);
        gain2.gain.setValueAtTime(baseVolume * this.osc2Settings.volume, this.audioContext.currentTime);
        
        // Set mixer volume
        mixerGain.gain.setValueAtTime(1, this.audioContext.currentTime);
        
        // Connect the audio graph
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(mixerGain);
        gain2.connect(mixerGain);
        mixerGain.connect(this.destinationNode);
        
        // Start oscillators
        osc1.start();
        osc2.start();
        
        // Store all components for note off
        this.activeOscillators.set(note, { 
            osc1, 
            osc2, 
            gain1, 
            gain2, 
            mixerGain 
        });
    }

    noteOff(note) {
        const activeNote = this.activeOscillators.get(note);
        if (activeNote) {
            const { osc1, osc2, gain1, gain2, mixerGain } = activeNote;
            
            // Fade out both oscillators
            gain1.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            // Stop both oscillators
            osc1.stop(this.audioContext.currentTime + 0.1);
            osc2.stop(this.audioContext.currentTime + 0.1);
            
            this.activeOscillators.delete(note);
        }
    }

    // Getter methods for accessing settings
    getSettings() {
        return {
            osc1: { ...this.osc1Settings },
            osc2: { ...this.osc2Settings }
        };
    }

    // Method to programmatically update settings
    updateSettings(newSettings) {
        if (newSettings.osc1) {
            Object.assign(this.osc1Settings, newSettings.osc1);
        }
        if (newSettings.osc2) {
            Object.assign(this.osc2Settings, newSettings.osc2);
        }
        this.updateActiveOscillators();
    }
}