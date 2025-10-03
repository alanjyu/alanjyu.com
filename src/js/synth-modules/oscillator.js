import { synthStorage } from './storage.js';
import { updateKnobRotation, initKnobRotations, setupKnobsWithDefaults, setupKnobMouseDrag } from './knobs.js';

export default class Oscillator {
    constructor(audioContext, destinationNode) {
        this.audioContext = audioContext;
        this.destinationNode = destinationNode;
        this.activeOscillators = new Map();
        this.storage = synthStorage;
        
        // Load oscillator settings from storage
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
        
        this.initControls();
        this.loadUIState();
        this.setupKnobDefaults();
    }

    /**
     * Setup knobs with default values and double-click reset functionality
     */
    setupKnobDefaults() {
        const defaultSettings = this.storage.getDefaultModuleSettings('oscillator');
        
        const knobConfigs = {
            '#osc1-volume': {
                defaultValue: defaultSettings.osc1.volume,
                onReset: (value) => {
                    // Update display
                    const display = document.querySelector('#osc1-volume').parentNode.parentNode.querySelector('.volume-display');
                    if (display) display.textContent = `${value}%`;
                    
                    // Update internal settings and storage
                    this.osc1Settings.volume = value / 100;
                    this.storage.updateSetting('oscillator', 'osc1.volume', value);
                    this.updateActiveOscillators();
                }
            },
            '#osc2-volume': {
                defaultValue: defaultSettings.osc2.volume,
                onReset: (value) => {
                    // Update display
                    const display = document.querySelector('#osc2-volume').parentNode.parentNode.querySelector('.volume-display');
                    if (display) display.textContent = `${value}%`;
                    
                    // Update internal settings and storage
                    this.osc2Settings.volume = value / 100;
                    this.storage.updateSetting('oscillator', 'osc2.volume', value);
                    this.updateActiveOscillators();
                }
            },
            '#osc2-detune': {
                defaultValue: defaultSettings.osc2.detune,
                onReset: (value) => {
                    // Update display
                    const display = document.querySelector('#osc2-detune').parentNode.parentNode.querySelector('.detune-display');
                    if (display) display.textContent = `${value} cents`;
                    
                    // Update internal settings and storage
                    this.osc2Settings.detune = value;
                    this.storage.updateSetting('oscillator', 'osc2.detune', value);
                    this.updateActiveOscillators();
                }
            }
        };
        
        setupKnobsWithDefaults(knobConfigs);
    }

    initControls() {
        // Waveform button controls
        const waveformButtons = document.querySelectorAll('.waveforms__button');
        
        // Event listeners for waveform buttons
        waveformButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const waveform = e.target.dataset.waveform;
                const oscNumber = e.target.dataset.osc;
                
                // Remove selected class from siblings
                const siblings = e.target.parentNode.querySelectorAll('.waveforms__button');
                siblings.forEach(btn => btn.classList.remove('selected'));
                
                // Add selected class to clicked button
                e.target.classList.add('selected');
                
                // Update oscillator settings and save to storage
                if (oscNumber === '1') {
                    this.osc1Settings.waveform = waveform;
                    this.storage.updateSetting('oscillator', 'osc1.waveform', waveform);
                } else if (oscNumber === '2') {
                    this.osc2Settings.waveform = waveform;
                    this.storage.updateSetting('oscillator', 'osc2.waveform', waveform);
                }
                
                this.updateActiveOscillators();
            });
        });

        // Volume and detune controls
        const osc1Volume = document.getElementById('osc1-volume');
        const osc2Volume = document.getElementById('osc2-volume');
        const osc2Detune = document.getElementById('osc2-detune');

        // Event listeners for volume controls
        osc1Volume?.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            this.osc1Settings.volume = volume / 100;
            this.storage.updateSetting('oscillator', 'osc1.volume', volume);
            e.target.parentNode.previousElementSibling.textContent = `${volume}%`;
            updateKnobRotation(e.target);
            this.updateActiveOscillators();
        });

        osc2Volume?.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            this.osc2Settings.volume = volume / 100;
            this.storage.updateSetting('oscillator', 'osc2.volume', volume);
            e.target.parentNode.previousElementSibling.textContent = `${volume}%`;
            updateKnobRotation(e.target);
            this.updateActiveOscillators();
        });

        osc2Detune?.addEventListener('input', (e) => {
            const detune = parseInt(e.target.value);
            this.osc2Settings.detune = detune;
            this.storage.updateSetting('oscillator', 'osc2.detune', detune);
            e.target.parentNode.previousElementSibling.textContent = `${detune} cents`;
            updateKnobRotation(e.target);
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
        this.loadUIState();
    }

    /**
     * Load UI state from storage settings
     */
    loadUIState() {
        const settings = this.storage.getModuleSettings('oscillator');
        
        // Update waveform buttons
        document.querySelectorAll('.waveforms__button[data-osc="1"]').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.waveform === settings.osc1?.waveform);
        });
        
        document.querySelectorAll('.waveforms__button[data-osc="2"]').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.waveform === settings.osc2?.waveform);
        });
        
        // Update sliders and displays
        const osc1Volume = document.getElementById('osc1-volume');
        const osc2Volume = document.getElementById('osc2-volume');
        const osc2Detune = document.getElementById('osc2-detune');
        
        if (osc1Volume) {
            osc1Volume.value = settings.osc1?.volume || 50;
            const display = osc1Volume.parentNode.previousElementSibling;
            if (display) display.textContent = `${osc1Volume.value}%`;
            updateKnobRotation(osc1Volume);
        }
        
        if (osc2Volume) {
            osc2Volume.value = settings.osc2?.volume || 30;
            const display = osc2Volume.parentNode.previousElementSibling;
            if (display) display.textContent = `${osc2Volume.value}%`;
            updateKnobRotation(osc2Volume);
        }
        
        if (osc2Detune) {
            osc2Detune.value = settings.osc2?.detune || 0;
            const display = osc2Detune.parentNode.previousElementSibling;
            if (display) display.textContent = `${osc2Detune.value} cents`;
            updateKnobRotation(osc2Detune);
        }
    }

    /**
     * Reset oscillator to default settings
     */
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
        
        this.updateActiveOscillators();
        this.loadUIState();
    }

    /**
     * Initialize oscillator settings and UI state from storage
     */
    initialize() {
        // Load settings from storage
        this.loadUIState();
        this.updateActiveOscillators();
    }
}