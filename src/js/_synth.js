export default class Synth {
    constructor() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        this.audioContext = new AudioContext();
        this.activeOscillators = new Map();
        
        // Oscillator settings
        this.osc1Settings = {
            waveform: 'sawtooth',
            volume: 0.5
        };
        
        this.osc2Settings = {
            waveform: 'sine',
            volume: 0.3,
            detune: 0
        };
        
        // Audio analysis setup
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        // Master gain for volume control
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        // Visualization setup
        this.canvas = document.getElementById('waveform');
        this.canvasCtx = this.canvas.getContext('2d');
        this.volumeFill = document.querySelector('.volume-fill');
        
        this.setupCanvas();
        this.startVisualization();
        this.initControls();

        // Keyboard to MIDI note mapping
        this.keyMap = {
            'KeyA': 60, 'KeyW': 61, 'KeyS': 62, 'KeyE': 63, 'KeyD': 64,
            'KeyF': 65, 'KeyT': 66, 'KeyG': 67, 'KeyY': 68, 'KeyH': 69,
            'KeyU': 70, 'KeyJ': 71, 'KeyK': 72, 'KeyO': 73, 'KeyL': 74,
            'KeyP': 75, 'Semicolon': 76,
        };

        this.initKeyboardListeners();
        this.initVisualKeyboard();

        // MIDI access
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(this.onMIDISuccess.bind(this), this.onMIDIFailure);
        }
    }

    initControls() {
        // Oscillator 1 controls
        const osc1Waveform = document.getElementById('osc1-waveform');
        const osc1Volume = document.getElementById('osc1-volume');
        
        // Oscillator 2 controls
        const osc2Waveform = document.getElementById('osc2-waveform');
        const osc2Volume = document.getElementById('osc2-volume');
        const osc2Detune = document.getElementById('osc2-detune');

        // Event listeners for OSC1
        osc1Waveform.addEventListener('change', (e) => {
            this.osc1Settings.waveform = e.target.value;
            this.updateActiveOscillators();
        });

        osc1Volume.addEventListener('input', (e) => {
            this.osc1Settings.volume = e.target.value / 100;
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            this.updateActiveOscillators();
        });

        // Event listeners for OSC2
        osc2Waveform.addEventListener('change', (e) => {
            this.osc2Settings.waveform = e.target.value;
            this.updateActiveOscillators();
        });

        osc2Volume.addEventListener('input', (e) => {
            this.osc2Settings.volume = e.target.value / 100;
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            this.updateActiveOscillators();
        });

        osc2Detune.addEventListener('input', (e) => {
            this.osc2Settings.detune = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${e.target.value} cents`;
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

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Handle canvas resize
        window.addEventListener('resize', () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
    }

    startVisualization() {
        const draw = () => {
            requestAnimationFrame(draw);
            
            // Get waveform data (time domain) instead of frequency data
            this.analyser.getByteTimeDomainData(this.dataArray);
            
            // Clear canvas
            const rect = this.canvas.getBoundingClientRect();
            this.canvasCtx.clearRect(0, 0, rect.width, rect.height);
            
            // Calculate volume for volume meter (using frequency data)
            const frequencyData = new Uint8Array(this.bufferLength);
            this.analyser.getByteFrequencyData(frequencyData);
            let sum = 0;
            for (let i = 0; i < this.bufferLength; i++) {
                sum += frequencyData[i];
            }
            const average = sum / this.bufferLength;
            const volumePercent = (average / 255) * 100;
            
            // Update mixer-style LED segments
            const segments = document.querySelectorAll('.volume-segment');
            const activeSegments = Math.floor((volumePercent / 100) * segments.length);
            
            segments.forEach((segment, index) => {
                if (index < activeSegments) {
                    segment.classList.add('active');
                } else {
                    segment.classList.remove('active');
                }
            });
            
            const volumePercentageElement = document.querySelector('.volume-percentage');
            if (volumePercentageElement) {
                volumePercentageElement.textContent = `${Math.round(volumePercent)}%`;
            }
            
            // Draw actual waveform
            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.strokeStyle = '#00ff88';
            this.canvasCtx.beginPath();
            
            const sliceWidth = rect.width / this.bufferLength;
            let x = 0;
            
            for (let i = 0; i < this.bufferLength; i++) {
                // Convert from 0-255 to -1 to 1, then to canvas coordinates
                const v = (this.dataArray[i] - 128) / 128;
                const y = (v * rect.height / 2) + (rect.height / 2);
                
                if (i === 0) {
                    this.canvasCtx.moveTo(x, y);
                } else {
                    this.canvasCtx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            this.canvasCtx.stroke();
        };
        
        draw();
    }

    initKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            
            const note = this.keyMap[e.code];
            if (note && !this.activeOscillators.has(note)) {
                this.noteOn(note, 100);
                this.activateVisualKey(e.code, true);
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            const note = this.keyMap[e.code];
            if (note) {
                this.noteOff(note);
                this.activateVisualKey(e.code, false);
                e.preventDefault();
            }
        });
    }

    initVisualKeyboard() {
        const keys = document.querySelectorAll('.key');
        
        keys.forEach(key => {
            const note = parseInt(key.dataset.note);
            
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (!this.activeOscillators.has(note)) {
                    this.noteOn(note, 100);
                    key.classList.add('active');
                }
            });

            key.addEventListener('mouseup', () => {
                this.noteOff(note);
                key.classList.remove('active');
            });

            key.addEventListener('mouseleave', () => {
                this.noteOff(note);
                key.classList.remove('active');
            });
        });
    }

    activateVisualKey(keyCode, active) {
        const visualKey = document.querySelector(`[data-key="${keyCode}"]`);
        if (visualKey) {
            if (active) {
                visualKey.classList.add('active');
            } else {
                visualKey.classList.remove('active');
            }
        }
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
        mixerGain.connect(this.masterGain);
        
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

    onMIDISuccess(midiAccess) {
        midiAccess.addEventListener('statechange', (e) => {
            console.log('Name: ' + e.port.name + ', Brand: ' + e.port.manufacturer + ', State: ' + e.port.state);

            const inputs = midiAccess.inputs;
            inputs.forEach((input) => {
                input.addEventListener('midimessage', (e) => {
                    const command = e.data[0];
                    const note = e.data[1];
                    const velocity = e.data.length > 2 ? e.data[2] : 0;

                    if (command === 144 && velocity > 0) { // Note on
                        this.noteOn(note, velocity);
                    } else if (command === 128 || (command === 144 && velocity === 0)) { // Note off
                        this.noteOff(note);
                    }
                });
            });
        });
    }

    onMIDIFailure() {
        console.warn('Could not access your MIDI devices.');
    }
}