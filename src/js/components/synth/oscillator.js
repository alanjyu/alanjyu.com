/**
 * Oscillator Module - Main coordinator for oscillator functionality
 * Manages settings, UI, and audio generation in a modular architecture
 */
import OscillatorGenerator from './oscillator/osc-generator.js';
import OscillatorSettings from './oscillator/osc-settings.js';
import OscillatorUI from './oscillator/osc-ui.js';

export default class Oscillator {
    constructor(audioContext, destinationNode) {
        this.audioContext = audioContext;
        this.destinationNode = destinationNode;
        
        // Initialize modular components
        this.generator = new OscillatorGenerator(audioContext);
        this.settings = new OscillatorSettings();
        
        // Initialize UI with settings change callback
        this.ui = new OscillatorUI(this.settings, () => {
            this.onSettingsChanged();
        });
        
        // Load initial UI state
        this.initialize();
    }

    /**
     * Handle settings changes - update active oscillators
     */
    onSettingsChanged() {
        const { osc1, osc2 } = this.settings.getSettings();
        this.generator.updateActiveOscillators(osc1, osc2);
    }

    /**
     * Start playing a note
     */
    noteOn(note, velocity) {
        const osc1Settings = this.settings.getOsc1Settings();
        const osc2Settings = this.settings.getOsc2Settings();
        
        this.generator.noteOn(note, velocity, osc1Settings, osc2Settings, this.destinationNode);
    }

    /**
     * Stop playing a note
     */
    noteOff(note) {
        this.generator.noteOff(note);
    }

    /**
     * Get current oscillator settings
     */
    getSettings() {
        return this.settings.getSettings();
    }

    /**
     * Update oscillator settings programmatically
     */
    updateSettings(newSettings) {
        this.settings.updateSettings(newSettings);
        this.onSettingsChanged();
        this.ui.loadUIState();
    }

    /**
     * Reset oscillator to default settings
     */
    resetToDefaults() {
        this.settings.resetToDefaults();
        this.onSettingsChanged();
        this.ui.loadUIState();
    }

    /**
     * Initialize oscillator - load UI state and apply settings
     */
    initialize() {
        this.ui.loadUIState();
        this.onSettingsChanged();
    }

    /**
     * Get count of currently active oscillators
     */
    getActiveCount() {
        return this.generator.getActiveCount();
    }

    /**
     * Stop all active oscillators
     */
    stopAll() {
        this.generator.stopAll();
    }
}