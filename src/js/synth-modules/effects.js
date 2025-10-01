export default class Effects {
    constructor(audioContext, inputNode, outputNode) {
        this.audioContext = audioContext;
        this.inputNode = inputNode;
        this.outputNode = outputNode;
        
        // Effects settings
        this.effects = {
            effect1: { type: 'none', node: null, params: {} },
            effect2: { type: 'none', node: null, params: {} }
        };
        
        // Create initial bypass nodes
        this.effect1Node = this.audioContext.createGain();
        this.effect2Node = this.audioContext.createGain();
        
        // Initial connection: input -> effect1 -> effect2 -> output
        this.inputNode.connect(this.effect1Node);
        this.effect1Node.connect(this.effect2Node);
        this.effect2Node.connect(this.outputNode);
        
        this.initControls();
    }

    initControls() {
        // Effect 1 controls
        const effect1Type = document.getElementById('effect1-type');
        const effect1Controls = document.getElementById('effect1-controls');
        
        // Effect 2 controls
        const effect2Type = document.getElementById('effect2-type');
        const effect2Controls = document.getElementById('effect2-controls');

        effect1Type?.addEventListener('change', (e) => {
            this.updateEffect('effect1', e.target.value, effect1Controls);
        });

        effect2Type?.addEventListener('change', (e) => {
            this.updateEffect('effect2', e.target.value, effect2Controls);
        });
    }

    updateEffect(effectSlot, effectType, controlsContainer) {
        // Remove existing effect
        if (this.effects[effectSlot].node && this.effects[effectSlot].node !== this.effect1Node && this.effects[effectSlot].node !== this.effect2Node) {
            this.effects[effectSlot].node.disconnect();
        }

        // Clear controls
        if (controlsContainer) {
            controlsContainer.innerHTML = '';
        }

        // Create new effect
        switch (effectType) {
            case 'reverb':
                this.createReverbEffect(effectSlot, controlsContainer);
                break;
            case 'chorus':
                this.createChorusEffect(effectSlot, controlsContainer);
                break;
            case 'delay':
                this.createDelayEffect(effectSlot, controlsContainer);
                break;
            case 'none':
            default:
                this.createBypassEffect(effectSlot);
                break;
        }

        this.effects[effectSlot].type = effectType;
        this.reconnectEffectsChain();
    }

    createReverbEffect(effectSlot, controlsContainer) {
        // Create convolver for reverb
        const convolver = this.audioContext.createConvolver();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const inputGain = this.audioContext.createGain();
        const outputGain = this.audioContext.createGain();

        // Create impulse response for reverb
        this.createImpulseResponse(convolver, 3, 0.8); // 3 seconds, 0.8 decay

        // Set initial values
        wetGain.gain.value = 0.3;
        dryGain.gain.value = 0.7;
        inputGain.gain.value = 1;
        outputGain.gain.value = 1;

        // Connect reverb routing: input -> [dry path & wet path] -> output
        // Dry path: inputGain -> dryGain -> outputGain
        // Wet path: inputGain -> convolver -> wetGain -> outputGain
        inputGain.connect(dryGain);
        inputGain.connect(convolver);
        convolver.connect(wetGain);
        dryGain.connect(outputGain);
        wetGain.connect(outputGain);

        // Create controls if container is provided
        if (controlsContainer) {
            controlsContainer.innerHTML = `
                <div class="effect-param">
                    <label>Room Size</label>
                    <div class="knob-container">
                        <input type="range" id="${effectSlot}-reverb-size" min="0.1" max="5" step="0.1" value="3">
                        <div class="knob"></div>
                    </div>
                    <span class="param-display">3.0s</span>
                </div>
                <div class="effect-param">
                    <label>Wet/Dry</label>
                    <div class="knob-container">
                        <input type="range" id="${effectSlot}-reverb-mix" min="0" max="100" value="30">
                        <div class="knob"></div>
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
            });

            mixControl?.addEventListener('input', (e) => {
                const wetLevel = e.target.value / 100;
                const dryLevel = 1 - wetLevel;
                wetGain.gain.setValueAtTime(wetLevel, this.audioContext.currentTime);
                dryGain.gain.setValueAtTime(dryLevel, this.audioContext.currentTime);
                e.target.nextElementSibling.textContent = `${e.target.value}%`;
            });
        }

        this.effects[effectSlot].node = { input: inputGain, output: outputGain, convolver, wetGain, dryGain };
        this.effects[effectSlot].params = { size: 3, mix: 30 };
    }

    createChorusEffect(effectSlot, controlsContainer) {
        const delayNode = this.audioContext.createDelay(0.05);
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const inputGain = this.audioContext.createGain();
        const outputGain = this.audioContext.createGain();

        // Configure chorus
        delayNode.delayTime.value = 0.015;
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 0.005;
        wetGain.gain.value = 0.5;
        dryGain.gain.value = 0.5;
        inputGain.gain.value = 1;
        outputGain.gain.value = 1;

        // Connect LFO to delay time
        lfo.connect(lfoGain);
        lfoGain.connect(delayNode.delayTime);
        lfo.start();

        // Connect chorus routing
        inputGain.connect(dryGain);
        inputGain.connect(delayNode);
        delayNode.connect(wetGain);
        dryGain.connect(outputGain);
        wetGain.connect(outputGain);

        // Create controls if container is provided
        if (controlsContainer) {
            controlsContainer.innerHTML = `
                <div class="effect-param">
                    <label>Rate</label>
                    <div class="knob-container">
                        <input type="range" id="${effectSlot}-chorus-rate" min="0.1" max="5" step="0.1" value="0.5">
                        <div class="knob"></div>
                    </div>
                    <span class="param-display">0.5 Hz</span>
                </div>
                <div class="effect-param">
                    <label>Depth</label>
                    <div class="knob-container">
                        <input type="range" id="${effectSlot}-chorus-depth" min="0" max="100" value="50">
                        <div class="knob"></div>
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
            });

            depthControl?.addEventListener('input', (e) => {
                const depth = e.target.value / 100;
                lfoGain.gain.setValueAtTime(depth * 0.01, this.audioContext.currentTime);
                wetGain.gain.setValueAtTime(depth * 0.5, this.audioContext.currentTime);
                dryGain.gain.setValueAtTime(1 - (depth * 0.5), this.audioContext.currentTime);
                e.target.nextElementSibling.textContent = `${e.target.value}%`;
            });
        }

        this.effects[effectSlot].node = { input: inputGain, output: outputGain, delayNode, wetGain, dryGain, lfo, lfoGain };
        this.effects[effectSlot].params = { rate: 0.5, depth: 50 };
    }

    createDelayEffect(effectSlot, controlsContainer) {
        const delayNode = this.audioContext.createDelay(1.0);
        const feedbackGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const inputGain = this.audioContext.createGain();
        const outputGain = this.audioContext.createGain();

        // Configure delay
        delayNode.delayTime.value = 0.3;
        feedbackGain.gain.value = 0.3;
        wetGain.gain.value = 0.3;
        dryGain.gain.value = 0.7;
        inputGain.gain.value = 1;
        outputGain.gain.value = 1;

        // Create feedback loop
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);

        // Connect delay routing
        inputGain.connect(dryGain);
        inputGain.connect(delayNode);
        delayNode.connect(wetGain);
        dryGain.connect(outputGain);
        wetGain.connect(outputGain);

        // Create controls if container is provided
        if (controlsContainer) {
            controlsContainer.innerHTML = `
                <div class="effect-param">
                    <label>Time</label>
                    <div class="knob-container">
                        <input type="range" id="${effectSlot}-delay-time" min="0.05" max="1" step="0.05" value="0.3">
                        <div class="knob"></div>
                    </div>
                    <span class="param-display">0.3s</span>
                </div>
                <div class="effect-param">
                    <label>Feedback</label>
                    <div class="knob-container">
                        <input type="range" id="${effectSlot}-delay-feedback" min="0" max="80" value="30">
                        <div class="knob"></div>
                    </div>
                    <span class="param-display">30%</span>
                </div>
                <div class="effect-param">
                    <label>Wet/Dry</label>
                    <div class="knob-container">
                        <input type="range" id="${effectSlot}-delay-mix" min="0" max="100" value="30">
                        <div class="knob"></div>
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
            });

            feedbackControl?.addEventListener('input', (e) => {
                const feedback = e.target.value / 100;
                feedbackGain.gain.setValueAtTime(feedback, this.audioContext.currentTime);
                e.target.nextElementSibling.textContent = `${e.target.value}%`;
            });

            mixControl?.addEventListener('input', (e) => {
                const wetLevel = e.target.value / 100;
                const dryLevel = 1 - wetLevel;
                wetGain.gain.setValueAtTime(wetLevel, this.audioContext.currentTime);
                dryGain.gain.setValueAtTime(dryLevel, this.audioContext.currentTime);
                e.target.nextElementSibling.textContent = `${e.target.value}%`;
            });
        }

        this.effects[effectSlot].node = { input: inputGain, output: outputGain, delayNode, feedbackGain, wetGain, dryGain };
        this.effects[effectSlot].params = { time: 0.3, feedback: 30, mix: 30 };
    }

    createBypassEffect(effectSlot) {
        const bypassGain = this.audioContext.createGain();
        bypassGain.gain.value = 1;
        this.effects[effectSlot].node = { input: bypassGain, output: bypassGain };
        this.effects[effectSlot].params = {};
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

    reconnectEffectsChain() {
        // Disconnect existing connections
        this.inputNode.disconnect();
        if (this.effects.effect1.node) this.effects.effect1.node.output.disconnect();
        if (this.effects.effect2.node) this.effects.effect2.node.output.disconnect();

        // Reconnect the chain based on current effects
        let currentNode = this.inputNode;

        if (this.effects.effect1.node) {
            currentNode.connect(this.effects.effect1.node.input);
            currentNode = this.effects.effect1.node.output;
        }

        if (this.effects.effect2.node) {
            currentNode.connect(this.effects.effect2.node.input);
            currentNode = this.effects.effect2.node.output;
        }

        currentNode.connect(this.outputNode);
    }

    // Get current effects state
    getEffectsState() {
        return {
            effect1: { type: this.effects.effect1.type, params: { ...this.effects.effect1.params } },
            effect2: { type: this.effects.effect2.type, params: { ...this.effects.effect2.params } }
        };
    }

    // Set effects state programmatically
    setEffectsState(state) {
        if (state.effect1) {
            const controlsContainer = document.getElementById('effect1-controls');
            this.updateEffect('effect1', state.effect1.type, controlsContainer);
        }
        if (state.effect2) {
            const controlsContainer = document.getElementById('effect2-controls');
            this.updateEffect('effect2', state.effect2.type, controlsContainer);
        }
    }
}