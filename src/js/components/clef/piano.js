const NOTE_SECONDS = 2.2;
const RELEASE_SECONDS = 0.035;
const MAX_PARTIALS = 20;

// A struck-string model: stretched partials, unison beating, and faster decay
// in the upper harmonics. All excitation is generated in the browser.
export function pianoModes(frequency, sampleRate) {
  const midi = 69 + 12 * Math.log2(frequency / 440);
  const stiffness = 0.000055 + 0.000025 * 2 ** ((midi - 60) / 12);
  const cutoff = Math.min(8500, sampleRate * 0.42);
  const modes = [];
  for (let harmonic = 1; harmonic <= MAX_PARTIALS; harmonic++) {
    const partial = frequency * harmonic * Math.sqrt((1 + stiffness * harmonic ** 2) / (1 + stiffness));
    if (partial >= cutoff) break;
    const strike = Math.abs(Math.sin(Math.PI * harmonic / 8.4));
    const amplitude = strike * Math.exp(-((partial / 6000) ** 1.4)) / harmonic ** 1.3;
    const decay = 0.85 * (440 / frequency) ** 0.25 / (1 + 0.2 * harmonic ** 1.3);
    modes.push({ frequency: partial, amplitude, decay, harmonic });
  }
  const total = modes.reduce((sum, mode) => sum + mode.amplitude, 0);
  return modes.map(mode => ({ ...mode, amplitude: mode.amplitude / total }));
}

function decayCurve(amplitude, decay) {
  return Float32Array.from({ length: 64 }, (_, index) => {
    const time = index / 63 * NOTE_SECONDS;
    return amplitude * (0.75 * Math.exp(-time / decay) + 0.25 * Math.exp(-time / (decay * 3.8)));
  });
}

export default class Piano {
  constructor(onPlaybackChange = () => {}) {
    this.context = null;
    this.input = null;
    this.hammer = null;
    this.voice = null;
    this.request = 0;
    this.playing = false;
    this.onPlaybackChange = onPlaybackChange;
  }

  setPlaying(playing) {
    if (this.playing === playing) return;
    this.playing = playing;
    this.onPlaybackChange(playing);
  }

  createOutput(context) {
    const input = context.createBiquadFilter();
    input.type = 'highpass';
    input.frequency.value = 28;
    input.Q.value = 0.5;
    const tone = context.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = Math.min(7800, context.sampleRate * 0.4);
    tone.Q.value = 0.45;
    const output = context.createGain();
    output.gain.value = 0.9;
    input.connect(tone);
    tone.connect(output);
    output.connect(context.destination);

    // Quiet resonant paths add the wooden body's color to the direct sound.
    for (const [frequency, q, volume] of [[185, 4, 0.045], [410, 5, 0.03], [940, 4, 0.02]]) {
      const resonance = context.createBiquadFilter();
      resonance.type = 'bandpass';
      resonance.frequency.value = frequency;
      resonance.Q.value = q;
      const gain = context.createGain();
      gain.gain.value = volume;
      input.connect(resonance);
      resonance.connect(gain);
      gain.connect(output);
    }
    this.input = input;

    // A brief, damped noise impulse supplies the felt-hammer attack.
    this.hammer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.04), context.sampleRate);
    const data = this.hammer.getChannelData(0);
    let seed = 2463534242;
    let filtered = 0;
    for (let index = 0; index < data.length; index++) {
      seed = (1664525 * seed + 1013904223) >>> 0;
      filtered = filtered * 0.6 + (seed / 2147483648 - 1) * 0.4;
      const time = index / context.sampleRate;
      data[index] = filtered * Math.min(1, time / 0.0005) * Math.exp(-time / 0.005);
    }
  }

  addNote(note, context, gain, now, sources, nodes) {
    const midi = Math.round(69 + 12 * Math.log2(note.frequency / 440));
    const position = Math.max(-0.32, Math.min(0.32, (midi - 60) / 60));
    const strings = midi < 44 ? [[0, 1]] : midi < 56 ? [[0, 0.76], [1.2, 0.24]] : [[0, 0.64], [-1.1, 0.18], [1.3, 0.18]];
    const buses = strings.map((_, index) => {
      const bus = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
      if (bus.pan) bus.pan.value = position + (index === 1 ? -0.12 : index === 2 ? 0.12 : 0);
      bus.connect(gain);
      nodes.push(bus);
      return bus;
    });
    const attack = 0.0015 + 0.0025 * (440 / note.frequency) ** 0.25;

    for (const mode of pianoModes(note.frequency, context.sampleRate)) {
      const unisons = mode.harmonic <= 4 ? strings : [[0, 1]];
      unisons.forEach(([detune, weight], index) => {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = mode.frequency;
        oscillator.detune.value = detune;
        const envelope = context.createGain();
        const amplitude = mode.amplitude * weight;
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(amplitude, now + attack);
        envelope.gain.setValueCurveAtTime(decayCurve(amplitude, mode.decay), now + attack + 0.00001, NOTE_SECONDS);
        oscillator.connect(envelope);
        envelope.connect(buses[index]);
        sources.push(oscillator);
        nodes.push(oscillator, envelope);
      });
    }

    const hammer = context.createBufferSource();
    hammer.buffer = this.hammer;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(3500, note.frequency * 5 + 700);
    const level = context.createGain();
    level.gain.value = 0.025;
    hammer.connect(filter);
    filter.connect(level);
    level.connect(buses[0]);
    sources.push(hammer);
    nodes.push(hammer, filter, level);
  }

  stopVoice() {
    const voice = this.voice;
    if (!voice) return;
    this.voice = null;
    const now = voice.context.currentTime;
    const volume = voice.gain.gain;
    if (volume.cancelAndHoldAtTime) volume.cancelAndHoldAtTime(now);
    else {
      volume.cancelScheduledValues(now);
      volume.setValueAtTime(volume.value, now);
    }
    volume.linearRampToValueAtTime(0, now + RELEASE_SECONDS);
    voice.sources.forEach(source => source.stop(now + RELEASE_SECONDS));
    this.setPlaying(false);
  }

  cancel() {
    this.request += 1;
    this.stopVoice();
  }

  async play(notes) {
    const request = ++this.request;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('Piano playback is not supported.');
    if (!this.context || this.context.state === 'closed') {
      this.context = new AudioContext();
      this.createOutput(this.context);
    }
    const context = this.context;
    try {
      if (context.state !== 'running') await context.resume();
    } catch (error) {
      if (request !== this.request || context !== this.context) return;
      throw error;
    }
    if (request !== this.request || context !== this.context || context.state === 'closed') return;
    this.stopVoice();

    const now = context.currentTime + 0.012;
    const gain = context.createGain();
    const volume = 0.48 / Math.sqrt(notes.length);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.setValueAtTime(volume, now + NOTE_SECONDS - 0.16);
    gain.gain.linearRampToValueAtTime(0, now + NOTE_SECONDS);
    gain.connect(this.input);
    const sources = [];
    const nodes = [gain];
    notes.forEach(note => this.addNote(note, context, gain, now, sources, nodes));
    const voice = { context, gain, sources };
    let remaining = sources.length;
    this.voice = voice;
    sources.forEach(source => {
      source.onended = () => {
        if (--remaining === 0) {
          nodes.forEach(node => node.disconnect());
          if (this.voice === voice) {
            this.voice = null;
            this.setPlaying(false);
          }
        }
      };
      source.start(now);
      source.stop(now + NOTE_SECONDS + 0.01);
    });
    this.setPlaying(true);
  }

  async close() {
    this.cancel();
    const context = this.context;
    this.context = null;
    this.input = null;
    this.hammer = null;
    if (context && context.state !== 'closed') await context.close();
  }
}
