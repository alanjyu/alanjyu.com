export default class Keyboard {
    constructor(noteOnCallback, noteOffCallback) {
        this.noteOnCallback = noteOnCallback;
        this.noteOffCallback = noteOffCallback;
        
        // Keyboard to MIDI note mapping
        this.keyMap = {
            'KeyA': 60, 'KeyW': 61, 'KeyS': 62, 'KeyE': 63, 'KeyD': 64,
            'KeyF': 65, 'KeyT': 66, 'KeyG': 67, 'KeyY': 68, 'KeyH': 69,
            'KeyU': 70, 'KeyJ': 71, 'KeyK': 72, 'KeyO': 73, 'KeyL': 74,
            'KeyP': 75, 'Semicolon': 76,
        };

        this.initKeyboardListeners();
        this.initVisualKeyboard();
        this.initMIDI();
    }

    initKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            
            const note = this.keyMap[e.code];
            if (note) {
                this.noteOnCallback(note, 100);
                this.activateVisualKey(e.code, true);
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            const note = this.keyMap[e.code];
            if (note) {
                this.noteOffCallback(note);
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
                this.noteOnCallback(note, 100);
                key.classList.add('active');
            });

            key.addEventListener('mouseup', () => {
                this.noteOffCallback(note);
                key.classList.remove('active');
            });

            key.addEventListener('mouseleave', () => {
                this.noteOffCallback(note);
                key.classList.remove('active');
            });

            // Prevent context menu on right click
            key.addEventListener('contextmenu', (e) => {
                e.preventDefault();
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

    initMIDI() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess()
                .then(this.onMIDISuccess.bind(this))
                .catch(this.onMIDIFailure.bind(this));
        }
    }

    onMIDISuccess(midiAccess) {
        console.log('MIDI access granted');
        
        midiAccess.addEventListener('statechange', (e) => {
            console.log('MIDI Port: ' + e.port.name + ', Brand: ' + e.port.manufacturer + ', State: ' + e.port.state);
        });

        const inputs = midiAccess.inputs;
        inputs.forEach((input) => {
            input.addEventListener('midimessage', (e) => {
                this.handleMIDIMessage(e);
            });
        });
    }

    onMIDIFailure(error) {
        console.warn('Could not access your MIDI devices:', error);
    }

    handleMIDIMessage(e) {
        const command = e.data[0];
        const note = e.data[1];
        const velocity = e.data.length > 2 ? e.data[2] : 0;

        if (command === 144 && velocity > 0) { // Note on
            this.noteOnCallback(note, velocity);
            this.activateVisualKeyByNote(note, true);
        } else if (command === 128 || (command === 144 && velocity === 0)) { // Note off
            this.noteOffCallback(note);
            this.activateVisualKeyByNote(note, false);
        }
    }

    activateVisualKeyByNote(note, active) {
        const visualKey = document.querySelector(`[data-note="${note}"]`);
        if (visualKey) {
            if (active) {
                visualKey.classList.add('active');
            } else {
                visualKey.classList.remove('active');
            }
        }
    }

    // Method to get current key mappings
    getKeyMap() {
        return { ...this.keyMap };
    }

    // Method to update key mappings
    setKeyMap(newKeyMap) {
        this.keyMap = { ...newKeyMap };
    }

    // Method to check if a note is currently active (for external queries)
    isNoteActive(note) {
        const visualKey = document.querySelector(`[data-note="${note}"]`);
        return visualKey ? visualKey.classList.contains('active') : false;
    }

    // Method to release all currently active keys
    releaseAllKeys() {
        const activeKeys = document.querySelectorAll('.key.active');
        activeKeys.forEach(key => {
            const note = parseInt(key.dataset.note);
            this.noteOffCallback(note);
            key.classList.remove('active');
        });

        // Also deactivate any computer keyboard visual indicators
        const activeKeyboardKeys = document.querySelectorAll('[data-key].active');
        activeKeyboardKeys.forEach(key => {
            key.classList.remove('active');
        });
    }
}