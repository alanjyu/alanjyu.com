import { updateKnobRotation, initKnobRotations } from './knobs.js';
import ReverbEffect from './effects/reverb.js';
import ChorusEffect from './effects/chorus.js';
import DelayEffect from './effects/delay.js';

export default class Effects {
    constructor(audioContext, inputNode, outputNode) {
        this.audioContext = audioContext;
        this.inputNode = inputNode;
        this.outputNode = outputNode;
        
        // Initialize effect instances
        this.effectTypes = {
            reverb: new ReverbEffect(audioContext),
            chorus: new ChorusEffect(audioContext),
            delay: new DelayEffect(audioContext)
        };
        
        // Initialize effects state
        this.effects = {
            effect1: { type: null, node: null, params: {} },
            effect2: { type: null, node: null, params: {} }
        };
        
        this.setupEffectChain();
        this.setupEffectControls();
    }

    setupEffectChain() {
        // Create effect slots
        this.effect1Input = this.audioContext.createGain();
        this.effect1Output = this.audioContext.createGain();
        this.effect2Input = this.audioContext.createGain();
        this.effect2Output = this.audioContext.createGain();
        
        // Connect the chain: input -> effect1 -> effect2 -> output
        this.inputNode.connect(this.effect1Input);
        this.effect1Output.connect(this.effect2Input);
        this.effect2Output.connect(this.outputNode);
        
        // Initially bypass both effects
        this.effect1Input.connect(this.effect1Output);
        this.effect2Input.connect(this.effect2Output);
    }

    setupEffectControls() {
        // Setup effect type selection
        const effect1Type = document.getElementById('effect1-type');
        const effect2Type = document.getElementById('effect2-type');
        
        effect1Type?.addEventListener('change', (e) => {
            const controlsContainer = document.getElementById('effect1-controls');
            this.updateEffect('effect1', e.target.value, controlsContainer);
        });

        effect2Type?.addEventListener('change', (e) => {
            const controlsContainer = document.getElementById('effect2-controls');
            this.updateEffect('effect2', e.target.value, controlsContainer);
        });
    }

    updateEffect(effectSlot, effectType, controlsContainer) {
        // Clean up existing effect
        if (this.effects[effectSlot].node) {
            this.disconnectEffect(effectSlot);
        }

        // Clear controls
        controlsContainer.innerHTML = '';

        if (effectType === 'none') {
            this.effects[effectSlot] = { type: null, node: null, params: {} };
            this.setupBypass(effectSlot);
            return;
        }

        // Create new effect
        const effectInstance = this.effectTypes[effectType];
        if (!effectInstance) return;

        const result = effectInstance.createEffect(effectSlot, controlsContainer);
        this.effects[effectSlot] = {
            type: effectType,
            node: result.node,
            params: result.params
        };

        // Connect the effect to the chain
        this.connectEffect(effectSlot);
    }

    connectEffect(effectSlot) {
        const effect = this.effects[effectSlot];
        if (!effect.node) return;

        if (effectSlot === 'effect1') {
            // Disconnect bypass
            this.effect1Input.disconnect(this.effect1Output);
            // Connect effect
            this.effect1Input.connect(effect.node.input);
            effect.node.output.connect(this.effect1Output);
        } else if (effectSlot === 'effect2') {
            // Disconnect bypass
            this.effect2Input.disconnect(this.effect2Output);
            // Connect effect
            this.effect2Input.connect(effect.node.input);
            effect.node.output.connect(this.effect2Output);
        }
    }

    disconnectEffect(effectSlot) {
        const effect = this.effects[effectSlot];
        if (!effect.node) return;

        // Disconnect effect nodes
        if (effectSlot === 'effect1') {
            this.effect1Input.disconnect(effect.node.input);
            effect.node.output.disconnect(this.effect1Output);
        } else if (effectSlot === 'effect2') {
            this.effect2Input.disconnect(effect.node.input);
            effect.node.output.disconnect(this.effect2Output);
        }

        // Setup bypass
        this.setupBypass(effectSlot);
    }

    setupBypass(effectSlot) {
        if (effectSlot === 'effect1') {
            this.effect1Input.connect(this.effect1Output);
        } else if (effectSlot === 'effect2') {
            this.effect2Input.connect(this.effect2Output);
        }
    }

    // Initialize all knob rotations for existing effects
    initializeKnobRotations() {
        const effectInputs = document.querySelectorAll('.effects input[type="range"]');
        effectInputs.forEach(input => {
            updateKnobRotation(input);
        });
    }

    // Get the current state of all effects
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