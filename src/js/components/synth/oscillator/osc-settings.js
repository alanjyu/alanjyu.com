/**
 * Oscillator Settings Manager - Handles settings persistence and default values
 */
import { synthStorage } from '../storage.js';

export default class OscillatorSettings {
    constructor() {
        this.storage = synthStorage;
        this.loadSettings();
    }

    loadSettings() {
        const savedSettings = this.storage.getModuleSettings('oscillator');
        
        this.osc1Settings = {
            waveform: savedSettings.osc1?.waveform || 'sawtooth',
            volume: (savedSettings.osc1?.volume || 50) / 100,
            phase: savedSettings.osc1?.phase || 0
        };
        
        this.osc2Settings = {
            waveform: savedSettings.osc2?.waveform || 'sine',
            volume: (savedSettings.osc2?.volume || 30) / 100,
            detune: savedSettings.osc2?.detune || 0,
            phase: savedSettings.osc2?.phase || 0
        };
    }

    updateOsc1Waveform(waveform) {
        this.osc1Settings.waveform = waveform;
        this.storage.updateSetting('oscillator', 'osc1.waveform', waveform);
    }

    updateOsc2Waveform(waveform) {
        this.osc2Settings.waveform = waveform;
        this.storage.updateSetting('oscillator', 'osc2.waveform', waveform);
    }

    updateOsc1Volume(volume) {
        this.osc1Settings.volume = volume / 100;
        this.storage.updateSetting('oscillator', 'osc1.volume', volume);
    }

    updateOsc2Volume(volume) {
        this.osc2Settings.volume = volume / 100;
        this.storage.updateSetting('oscillator', 'osc2.volume', volume);
    }

    updateOsc2Detune(detune) {
        this.osc2Settings.detune = detune;
        this.storage.updateSetting('oscillator', 'osc2.detune', detune);
    }

    getSettings() {
        return {
            osc1: { ...this.osc1Settings },
            osc2: { ...this.osc2Settings }
        };
    }

    getOsc1Settings() {
        return { ...this.osc1Settings };
    }

    getOsc2Settings() {
        return { ...this.osc2Settings };
    }

    updateSettings(newSettings) {
        if (newSettings.osc1) {
            Object.assign(this.osc1Settings, newSettings.osc1);
        }
        if (newSettings.osc2) {
            Object.assign(this.osc2Settings, newSettings.osc2);
        }
    }

    resetToDefaults() {
        this.storage.resetModuleToDefaults('oscillator');
        const defaultSettings = this.storage.getDefaultModuleSettings('oscillator');
        
        this.osc1Settings = {
            waveform: defaultSettings.osc1.waveform,
            volume: defaultSettings.osc1.volume / 100,
            phase: defaultSettings.osc1.phase
        };
        
        this.osc2Settings = {
            waveform: defaultSettings.osc2.waveform,
            volume: defaultSettings.osc2.volume / 100,
            detune: defaultSettings.osc2.detune,
            phase: defaultSettings.osc2.phase
        };
    }

    getDefaultSettings() {
        return this.storage.getDefaultModuleSettings('oscillator');
    }
}