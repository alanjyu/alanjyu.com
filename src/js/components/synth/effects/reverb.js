import { updateKnobRotation, setupKnobDoubleClickReset, setupKnobMouseDrag } from '../knobs.js';

export default class ReverbEffect {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.type = 'reverb';
        this.params = { size: 3, mix: 30 };
    }

    createEffect(effectSlot, controlsContainer) {
        const convolver = this.audioContext.createConvolver();
        const inputGain = this.audioContext.createGain();
        const outputGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();

        // Set up initial values
        wetGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);

        // Create impulse response
        this.createImpulseResponse(convolver, 3, 0.8);

        // Connect the audio graph
        inputGain.connect(convolver);
        inputGain.connect(dryGain);
        convolver.connect(wetGain);
        wetGain.connect(outputGain);
        dryGain.connect(outputGain);

        // Create controls
        this.createControls(effectSlot, controlsContainer, convolver, wetGain, dryGain);

        return {
            node: { input: inputGain, output: outputGain, convolver, wetGain, dryGain },
            params: { ...this.params }
        };
    }

    createControls(effectSlot, controlsContainer, convolver, wetGain, dryGain) {
        controlsContainer.innerHTML = `
            <div class="effect-param">
                <label>Room Size</label>
                <div class="knob-container">
                    <input type="range" id="${effectSlot}-reverb-size" min="0.1" max="5" step="0.1" value="3">
                    <div class="knob">
                        <div class="knob-indicator"></div>
                    </div>
                </div>
                <span class="param-display">3.0s</span>
            </div>
            <div class="effect-param">
                <label>Wet/Dry</label>
                <div class="knob-container">
                    <input type="range" id="${effectSlot}-reverb-mix" min="0" max="100" value="30">
                    <div class="knob">
                        <div class="knob-indicator"></div>
                    </div>
                </div>
                <span class="param-display">30%</span>
            </div>
        `;

        // Add event listeners
        const sizeControl = document.getElementById(`${effectSlot}-reverb-size`);
        const mixControl = document.getElementById(`${effectSlot}-reverb-mix`);

        sizeControl?.addEventListener('input', (e) => {
            const size = parseFloat(e.target.value);
            this.createImpulseResponse(convolver, size, 0.8);
            e.target.nextElementSibling.textContent = `${size}s`;
            updateKnobRotation(e.target);
        });

        mixControl?.addEventListener('input', (e) => {
            const wetLevel = e.target.value / 100;
            const dryLevel = 1 - wetLevel;
            wetGain.gain.setValueAtTime(wetLevel, this.audioContext.currentTime);
            dryGain.gain.setValueAtTime(dryLevel, this.audioContext.currentTime);
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            updateKnobRotation(e.target);
        });

        // Setup double-click reset for reverb controls
        setupKnobDoubleClickReset(sizeControl, 3, (value) => {
            this.createImpulseResponse(convolver, value, 0.8);
            sizeControl.nextElementSibling.textContent = `${value}s`;
        });

        setupKnobDoubleClickReset(mixControl, 30, (value) => {
            const wetLevel = value / 100;
            const dryLevel = 1 - wetLevel;
            wetGain.gain.setValueAtTime(wetLevel, this.audioContext.currentTime);
            dryGain.gain.setValueAtTime(dryLevel, this.audioContext.currentTime);
            mixControl.nextElementSibling.textContent = `${value}%`;
        });

        // Setup mouse drag for reverb controls
        setupKnobMouseDrag(sizeControl, (value) => {
            this.createImpulseResponse(convolver, value, 0.8);
            sizeControl.nextElementSibling.textContent = `${value}s`;
        });

        setupKnobMouseDrag(mixControl, (value) => {
            const wetLevel = value / 100;
            const dryLevel = 1 - wetLevel;
            wetGain.gain.setValueAtTime(wetLevel, this.audioContext.currentTime);
            dryGain.gain.setValueAtTime(dryLevel, this.audioContext.currentTime);
            mixControl.nextElementSibling.textContent = `${value}%`;
        });
    }

    createImpulseResponse(convolver, duration, decay) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = length - i;
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
            }
        }
        
        convolver.buffer = impulse;
    }
}