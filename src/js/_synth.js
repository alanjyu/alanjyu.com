import Display from './synth-modules/display.js';
import Oscillator from './synth-modules/oscillator.js';
import Keyboard from './synth-modules/keyboard.js';
import Effects from './synth-modules/effects.js';
import Filter from './synth-modules/filter.js';

export default class Synth {
    constructor() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // Audio chain setup
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.masterGain = this.audioContext.createGain();
        
        // Create filter gain node to connect between oscillator and effects
        this.filterGain = this.audioContext.createGain();
        
        // Initialize modules with proper audio chain
        this.display = new Display(this.audioContext, this.analyser);
        this.oscillator = new Oscillator(this.audioContext, this.filterGain);
        this.filter = new Filter(this.audioContext, this.filterGain, this.masterGain);
        this.effects = new Effects(this.audioContext, this.masterGain, this.analyser);
        this.keyboard = new Keyboard(
            (note, velocity) => this.oscillator.noteOn(note, velocity),
            (note) => this.oscillator.noteOff(note)
        );
        
        // Initialize modules after creation
        this.oscillator.initialize();
        this.effects.initializeKnobRotations();
        
        // Set up init button
        this.setupInitButton();
        
        // Set up stop button
        this.setupStopButton();
        
        // Set up audio context resume on user interaction
        this.setupAudioContextResume();
        
        // Connect final audio chain: analyser -> destination
        this.analyser.connect(this.audioContext.destination);
    }

    // Setup audio context resume on user interaction
    setupAudioContextResume() {
        const resumeAudio = async () => {
            if (this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    console.log('Audio context resumed');
                } catch (error) {
                    console.error('Failed to resume audio context:', error);
                }
            }
        };

        // Resume audio context on any user interaction with the synth
        const synthElement = document.querySelector('.synth');
        if (synthElement) {
            ['click', 'keydown', 'touchstart'].forEach(eventType => {
                synthElement.addEventListener(eventType, resumeAudio, { once: true });
            });
        }

        // Also try to resume when any key is pressed or button clicked
        document.addEventListener('click', resumeAudio, { once: true });
        document.addEventListener('keydown', resumeAudio, { once: true });
    }

    // Setup the init button functionality
    setupInitButton() {
        const initButton = document.getElementById('init-button');
        if (initButton) {
            initButton.addEventListener('click', () => {
                this.resetToDefaults();
            });
        }
    }

    // Setup the stop button functionality
    setupStopButton() {
        const stopButton = document.getElementById('stop-button');
        if (stopButton) {
            stopButton.addEventListener('click', () => {
                this.stopAllSound();
            });
        }
    }

    // Stop all sound and visual feedback
    stopAllSound() {
        const stopButton = document.getElementById('stop-button');
        
        // Add visual feedback
        if (stopButton) {
            stopButton.classList.add('pressed');
            setTimeout(() => {
                stopButton.classList.remove('pressed');
            }, 500);
        }
        
        // Stop all oscillators and notes
        this.oscillator.stopAll();
        
        // Reset keyboard state (release visual keys)
        this.keyboard.releaseAllKeys();
        
        console.log('All sound stopped');
    }

    // Reset all modules to their default settings
    resetToDefaults() {
        const initButton = document.getElementById('init-button');
        
        // Add visual feedback
        if (initButton) {
            initButton.classList.add('pressed');
            setTimeout(() => {
                initButton.classList.remove('pressed');
            }, 500);
        }
        
        // Reset all modules
        this.oscillator.resetToDefaults();
        this.filter.resetToDefaults();
        this.effects.resetToDefaults();
        
        // Small delay to show the reset is happening
        setTimeout(() => {
            console.log('Synthesizer reset to default settings');
        }, 100);
    }

    // Public API methods for external access
    
    // Get the audio context (useful for external modules)
    getAudioContext() {
        return this.audioContext;
    }
    
    // Get the current state of all modules
    getState() {
        return {
            oscillator: this.oscillator.getSettings(),
            filter: this.filter.getSettings(),
            effects: this.effects.getEffectsState(),
            keyboard: this.keyboard.getKeyMap()
        };
    }
    
    // Set the state of all modules
    setState(state) {
        if (state.oscillator) {
            this.oscillator.updateSettings(state.oscillator);
        }
        if (state.filter) {
            this.filter.setSettings(state.filter);
        }
        if (state.effects) {
            this.effects.setEffectsState(state.effects);
        }
        if (state.keyboard) {
            this.keyboard.setKeyMap(state.keyboard);
        }
    }
    
    // Resume audio context if suspended (for user interaction requirement)
    resume() {
        if (this.audioContext.state === 'suspended') {
            return this.audioContext.resume();
        }
        return Promise.resolve();
    }
}