/**
 * Oscillator Generator - Handles individual oscillator creation and audio synthesis
 */
export default class OscillatorGenerator {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.activeOscillators = new Map();
    }

    /**
     * Create and start oscillators for a note
     */
    noteOn(note, velocity, osc1Settings, osc2Settings, destinationNode) {
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
        osc1.type = osc1Settings.waveform;
        
        // Configure oscillator 2 with detune
        osc2.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        osc2.type = osc2Settings.waveform;
        osc2.detune.setValueAtTime(osc2Settings.detune, this.audioContext.currentTime);
        
        // Set volumes based on velocity and oscillator settings
        const baseVolume = (velocity / 127) * 0.3;
        gain1.gain.setValueAtTime(baseVolume * osc1Settings.volume, this.audioContext.currentTime);
        gain2.gain.setValueAtTime(baseVolume * osc2Settings.volume, this.audioContext.currentTime);
        
        // Set mixer volume
        mixerGain.gain.setValueAtTime(1, this.audioContext.currentTime);
        
        // Connect the audio graph
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(mixerGain);
        gain2.connect(mixerGain);
        mixerGain.connect(destinationNode);
        
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

    /**
     * Stop oscillators for a note
     */
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

    /**
     * Update settings for all active oscillators
     */
    updateActiveOscillators(osc1Settings, osc2Settings) {
        this.activeOscillators.forEach(({ osc1, osc2, gain1, gain2 }, note) => {
            // Update waveforms
            osc1.type = osc1Settings.waveform;
            osc2.type = osc2Settings.waveform;
            
            // Update volumes
            gain1.gain.setValueAtTime(osc1Settings.volume * 0.3, this.audioContext.currentTime);
            gain2.gain.setValueAtTime(osc2Settings.volume * 0.3, this.audioContext.currentTime);
            
            // Update detune
            const frequency = 440 * Math.pow(2, (note - 69) / 12);
            osc2.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            osc2.detune.setValueAtTime(osc2Settings.detune, this.audioContext.currentTime);
        });
    }

    /**
     * Get count of active oscillators
     */
    getActiveCount() {
        return this.activeOscillators.size;
    }

    /**
     * Stop all active oscillators
     */
    stopAll() {
        this.activeOscillators.forEach((_, note) => {
            this.noteOff(note);
        });
    }
}