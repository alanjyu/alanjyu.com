/**
 * Oscillator UI Controls - Handles user interface interactions and display updates
 */
import { updateKnobRotation, setupKnobsWithDefaults } from '../knobs.js';

export default class OscillatorUI {
    constructor(settings, onSettingsChange) {
        this.settings = settings;
        this.onSettingsChange = onSettingsChange;
        this.initControls();
        this.setupKnobDefaults();
    }

    /**
     * Setup knobs with default values and double-click reset functionality
     */
    setupKnobDefaults() {
        const defaultSettings = this.settings.getDefaultSettings();
        
        const knobConfigs = {
            '#osc1-volume': {
                defaultValue: defaultSettings.osc1.volume,
                onReset: (value) => {
                    this.updateVolumeDisplay('osc1', value);
                    this.settings.updateOsc1Volume(value);
                    this.onSettingsChange();
                }
            },
            '#osc2-volume': {
                defaultValue: defaultSettings.osc2.volume,
                onReset: (value) => {
                    this.updateVolumeDisplay('osc2', value);
                    this.settings.updateOsc2Volume(value);
                    this.onSettingsChange();
                }
            },
            '#osc2-detune': {
                defaultValue: defaultSettings.osc2.detune,
                onReset: (value) => {
                    this.updateDetuneDisplay(value);
                    this.settings.updateOsc2Detune(value);
                    this.onSettingsChange();
                }
            }
        };
        
        setupKnobsWithDefaults(knobConfigs);
    }

    /**
     * Initialize UI controls and event listeners
     */
    initControls() {
        this.setupWaveformButtons();
        this.setupVolumeControls();
        this.setupDetuneControl();
    }

    /**
     * Setup waveform button controls
     */
    setupWaveformButtons() {
        const waveformButtons = document.querySelectorAll('.waveforms__button');
        
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
                
                // Update settings
                if (oscNumber === '1') {
                    this.settings.updateOsc1Waveform(waveform);
                } else if (oscNumber === '2') {
                    this.settings.updateOsc2Waveform(waveform);
                }
                
                this.onSettingsChange();
            });
        });
    }

    /**
     * Setup volume control event listeners
     */
    setupVolumeControls() {
        const osc1Volume = document.getElementById('osc1-volume');
        const osc2Volume = document.getElementById('osc2-volume');

        osc1Volume?.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            this.settings.updateOsc1Volume(volume);
            this.updateVolumeDisplay('osc1', volume);
            updateKnobRotation(e.target);
            this.onSettingsChange();
        });

        osc2Volume?.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            this.settings.updateOsc2Volume(volume);
            this.updateVolumeDisplay('osc2', volume);
            updateKnobRotation(e.target);
            this.onSettingsChange();
        });
    }

    /**
     * Setup detune control event listener
     */
    setupDetuneControl() {
        const osc2Detune = document.getElementById('osc2-detune');

        osc2Detune?.addEventListener('input', (e) => {
            const detune = parseInt(e.target.value);
            this.settings.updateOsc2Detune(detune);
            this.updateDetuneDisplay(detune);
            updateKnobRotation(e.target);
            this.onSettingsChange();
        });
    }

    /**
     * Update volume display for oscillator
     */
    updateVolumeDisplay(oscType, volume) {
        const knobId = oscType === 'osc1' ? '#osc1-volume' : '#osc2-volume';
        const knob = document.querySelector(knobId);
        if (knob) {
            const display = knob.parentNode.previousElementSibling;
            if (display) display.textContent = `${volume}%`;
        }
    }

    /**
     * Update detune display
     */
    updateDetuneDisplay(detune) {
        const knob = document.querySelector('#osc2-detune');
        if (knob) {
            const display = knob.parentNode.previousElementSibling;
            if (display) display.textContent = `${detune}c`;
        }
    }

    /**
     * Load UI state from current settings
     */
    loadUIState() {
        const currentSettings = this.settings.getSettings();
        
        // Update waveform buttons
        document.querySelectorAll('.waveforms__button[data-osc="1"]').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.waveform === currentSettings.osc1.waveform);
        });
        
        document.querySelectorAll('.waveforms__button[data-osc="2"]').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.waveform === currentSettings.osc2.waveform);
        });
        
        // Update sliders and displays
        const osc1Volume = document.getElementById('osc1-volume');
        const osc2Volume = document.getElementById('osc2-volume');
        const osc2Detune = document.getElementById('osc2-detune');
        
        if (osc1Volume) {
            const volumeValue = Math.round(currentSettings.osc1.volume * 100);
            osc1Volume.value = volumeValue;
            this.updateVolumeDisplay('osc1', volumeValue);
            updateKnobRotation(osc1Volume);
        }
        
        if (osc2Volume) {
            const volumeValue = Math.round(currentSettings.osc2.volume * 100);
            osc2Volume.value = volumeValue;
            this.updateVolumeDisplay('osc2', volumeValue);
            updateKnobRotation(osc2Volume);
        }
        
        if (osc2Detune) {
            osc2Detune.value = currentSettings.osc2.detune;
            this.updateDetuneDisplay(currentSettings.osc2.detune);
            updateKnobRotation(osc2Detune);
        }
    }
}