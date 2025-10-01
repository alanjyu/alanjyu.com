import Display from './synth-modules/display.js';
import Oscillator from './synth-modules/oscillator.js';
import Keyboard from './synth-modules/keyboard.js';
import Effects from './synth-modules/effects.js';

export default class Synth {
    constructor() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // Audio chain setup
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.masterGain = this.audioContext.createGain();
        
        // Initialize modules
        this.display = new Display(this.audioContext, this.analyser);
        this.effects = new Effects(this.audioContext, this.masterGain, this.analyser);
        this.oscillator = new Oscillator(this.audioContext, this.masterGain);
        this.keyboard = new Keyboard(
            (note, velocity) => this.oscillator.noteOn(note, velocity),
            (note) => this.oscillator.noteOff(note)
        );
        
        // Connect final audio chain: analyser -> destination
        this.analyser.connect(this.audioContext.destination);
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
            effects: this.effects.getEffectsState(),
            keyboard: this.keyboard.getKeyMap()
        };
    }
    
    // Set the state of all modules
    setState(state) {
        if (state.oscillator) {
            this.oscillator.updateSettings(state.oscillator);
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