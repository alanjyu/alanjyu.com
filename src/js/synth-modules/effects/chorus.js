import { updateKnobRotation, setupKnobDoubleClickReset, setupKnobMouseDrag } from '../knobs.js';

export default class ChorusEffect {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.type = 'chorus';
        this.params = { rate: 0.5, depth: 50 };
    }

    createEffect(effectSlot, controlsContainer) {
        const delayNode = this.audioContext.createDelay(0.05);
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const inputGain = this.audioContext.createGain();
        const outputGain = this.audioContext.createGain();

        // Set up initial values
        delayNode.delayTime.setValueAtTime(0.02, this.audioContext.currentTime);
        lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(0.005, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(0.75, this.audioContext.currentTime);

        // Connect the audio graph
        inputGain.connect(delayNode);
        inputGain.connect(dryGain);
        lfo.connect(lfoGain);
        lfoGain.connect(delayNode.delayTime);
        delayNode.connect(wetGain);
        wetGain.connect(outputGain);
        dryGain.connect(outputGain);

        // Start the LFO
        lfo.start();

        // Create controls
        this.createControls(effectSlot, controlsContainer, lfo, lfoGain, wetGain, dryGain);

        return {
            node: { input: inputGain, output: outputGain, delayNode, wetGain, dryGain, lfo, lfoGain },
            params: { ...this.params }
        };
    }

    createControls(effectSlot, controlsContainer, lfo, lfoGain, wetGain, dryGain) {
        controlsContainer.innerHTML = `
            <div class="effect-param">
                <label>Rate</label>
                <div class="knob-container">
                    <input type="range" id="${effectSlot}-chorus-rate" min="0.1" max="5" step="0.1" value="0.5">
                    <div class="knob">
                        <div class="knob-indicator"></div>
                    </div>
                </div>
                <span class="param-display">0.5 Hz</span>
            </div>
            <div class="effect-param">
                <label>Depth</label>
                <div class="knob-container">
                    <input type="range" id="${effectSlot}-chorus-depth" min="0" max="100" value="50">
                    <div class="knob">
                        <div class="knob-indicator"></div>
                    </div>
                </div>
                <span class="param-display">50%</span>
            </div>
        `;

        // Add event listeners
        const rateControl = document.getElementById(`${effectSlot}-chorus-rate`);
        const depthControl = document.getElementById(`${effectSlot}-chorus-depth`);

        rateControl?.addEventListener('input', (e) => {
            const rate = parseFloat(e.target.value);
            lfo.frequency.setValueAtTime(rate, this.audioContext.currentTime);
            e.target.nextElementSibling.textContent = `${rate} Hz`;
            updateKnobRotation(e.target);
        });

        depthControl?.addEventListener('input', (e) => {
            const depth = e.target.value / 100;
            lfoGain.gain.setValueAtTime(depth * 0.01, this.audioContext.currentTime);
            wetGain.gain.setValueAtTime(depth * 0.5, this.audioContext.currentTime);
            dryGain.gain.setValueAtTime(1 - (depth * 0.5), this.audioContext.currentTime);
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            updateKnobRotation(e.target);
        });

        // Setup double-click reset for chorus controls
        setupKnobDoubleClickReset(rateControl, 0.5, (value) => {
            lfo.frequency.setValueAtTime(value, this.audioContext.currentTime);
            rateControl.nextElementSibling.textContent = `${value} Hz`;
        });

        setupKnobDoubleClickReset(depthControl, 50, (value) => {
            const depth = value / 100;
            lfoGain.gain.setValueAtTime(depth * 0.01, this.audioContext.currentTime);
            wetGain.gain.setValueAtTime(depth * 0.5, this.audioContext.currentTime);
            dryGain.gain.setValueAtTime(1 - (depth * 0.5), this.audioContext.currentTime);
            depthControl.nextElementSibling.textContent = `${value}%`;
        });

        // Setup mouse drag for chorus controls
        setupKnobMouseDrag(rateControl, (value) => {
            lfo.frequency.setValueAtTime(value, this.audioContext.currentTime);
            rateControl.nextElementSibling.textContent = `${value} Hz`;
        });

        setupKnobMouseDrag(depthControl, (value) => {
            const depth = value / 100;
            lfoGain.gain.setValueAtTime(depth * 0.01, this.audioContext.currentTime);
            wetGain.gain.setValueAtTime(depth * 0.5, this.audioContext.currentTime);
            dryGain.gain.setValueAtTime(1 - (depth * 0.5), this.audioContext.currentTime);
            depthControl.nextElementSibling.textContent = `${value}%`;
        });
    }
}