import { updateKnobRotation, setupKnobDoubleClickReset, setupKnobMouseDrag } from '../knobs.js';

export default class DelayEffect {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.type = 'delay';
        this.params = { time: 0.3, feedback: 30, mix: 30 };
    }

    createEffect(effectSlot, controlsContainer) {
        const delayNode = this.audioContext.createDelay(1.0);
        const feedbackGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const inputGain = this.audioContext.createGain();
        const outputGain = this.audioContext.createGain();

        // Set up initial values
        delayNode.delayTime.setValueAtTime(0.3, this.audioContext.currentTime);
        feedbackGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);

        // Connect the audio graph
        inputGain.connect(delayNode);
        inputGain.connect(dryGain);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        delayNode.connect(wetGain);
        wetGain.connect(outputGain);
        dryGain.connect(outputGain);

        // Create controls
        this.createControls(effectSlot, controlsContainer, delayNode, feedbackGain, wetGain, dryGain);

        return {
            node: { input: inputGain, output: outputGain, delayNode, feedbackGain, wetGain, dryGain },
            params: { ...this.params }
        };
    }

    createControls(effectSlot, controlsContainer, delayNode, feedbackGain, wetGain, dryGain) {
        controlsContainer.innerHTML = `
            <div class="effect-param">
                <label>Time</label>
                <div class="knob-container">
                    <input type="range" id="${effectSlot}-delay-time" min="0.01" max="1" step="0.01" value="0.3">
                    <div class="knob">
                        <div class="knob-indicator"></div>
                    </div>
                </div>
                <span class="param-display">0.3s</span>
            </div>
            <div class="effect-param">
                <label>Feedback</label>
                <div class="knob-container">
                    <input type="range" id="${effectSlot}-delay-feedback" min="0" max="95" value="30">
                    <div class="knob">
                        <div class="knob-indicator"></div>
                    </div>
                </div>
                <span class="param-display">30%</span>
            </div>
            <div class="effect-param">
                <label>Wet/Dry</label>
                <div class="knob-container">
                    <input type="range" id="${effectSlot}-delay-mix" min="0" max="100" value="30">
                    <div class="knob">
                        <div class="knob-indicator"></div>
                    </div>
                </div>
                <span class="param-display">30%</span>
            </div>
        `;

        // Add event listeners
        const timeControl = document.getElementById(`${effectSlot}-delay-time`);
        const feedbackControl = document.getElementById(`${effectSlot}-delay-feedback`);
        const mixControl = document.getElementById(`${effectSlot}-delay-mix`);

        timeControl?.addEventListener('input', (e) => {
            const time = parseFloat(e.target.value);
            delayNode.delayTime.setValueAtTime(time, this.audioContext.currentTime);
            e.target.nextElementSibling.textContent = `${time}s`;
            updateKnobRotation(e.target);
        });

        feedbackControl?.addEventListener('input', (e) => {
            const feedback = e.target.value / 100;
            feedbackGain.gain.setValueAtTime(feedback, this.audioContext.currentTime);
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
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

        // Setup double-click reset for delay controls
        setupKnobDoubleClickReset(timeControl, 0.3, (value) => {
            delayNode.delayTime.setValueAtTime(value, this.audioContext.currentTime);
            timeControl.nextElementSibling.textContent = `${value}s`;
        });

        setupKnobDoubleClickReset(feedbackControl, 30, (value) => {
            const feedback = value / 100;
            feedbackGain.gain.setValueAtTime(feedback, this.audioContext.currentTime);
            feedbackControl.nextElementSibling.textContent = `${value}%`;
        });

        setupKnobDoubleClickReset(mixControl, 30, (value) => {
            const wetLevel = value / 100;
            const dryLevel = 1 - wetLevel;
            wetGain.gain.setValueAtTime(wetLevel, this.audioContext.currentTime);
            dryGain.gain.setValueAtTime(dryLevel, this.audioContext.currentTime);
            mixControl.nextElementSibling.textContent = `${value}%`;
        });

        // Setup mouse drag for delay controls
        setupKnobMouseDrag(timeControl, (value) => {
            delayNode.delayTime.setValueAtTime(value, this.audioContext.currentTime);
            timeControl.nextElementSibling.textContent = `${value}s`;
        });

        setupKnobMouseDrag(feedbackControl, (value) => {
            const feedback = value / 100;
            feedbackGain.gain.setValueAtTime(feedback, this.audioContext.currentTime);
            feedbackControl.nextElementSibling.textContent = `${value}%`;
        });

        setupKnobMouseDrag(mixControl, (value) => {
            const wetLevel = value / 100;
            const dryLevel = 1 - wetLevel;
            wetGain.gain.setValueAtTime(wetLevel, this.audioContext.currentTime);
            dryGain.gain.setValueAtTime(dryLevel, this.audioContext.currentTime);
            mixControl.nextElementSibling.textContent = `${value}%`;
        });
    }
}