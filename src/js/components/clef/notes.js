export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const ANSWER_PITCHES = { C: 0, 'B#': 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4, F: 5, 'E#': 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, Cb: 11 };
export const KEYBOARD_ANSWERS = { z: 'C', x: 'D', c: 'E', v: 'F', b: 'G', n: 'A', m: 'B', s: 'C#', d: 'D#', g: 'F#', h: 'G#', j: 'A#' };
// Include three ledger lines above and below either staff.
export const NOTE_STEPS = { min: -6, max: 14 };
export const MIDDLE_C_STEPS = { treble: -2, bass: 10 };

export function noteStepsForClef(clef, mode) {
  if (mode !== 'mixed') return NOTE_STEPS;
  return clef === 'treble'
    ? { min: MIDDLE_C_STEPS.treble, max: NOTE_STEPS.max }
    : { min: NOTE_STEPS.min, max: MIDDLE_C_STEPS.bass };
}

const SEMITONES = [0, 2, 4, 5, 7, 9, 11];
// Diatonic indices, starting at C0. Bottom lines: E4 (treble), G2 (bass).
const BOTTOM_LINES = { treble: 30, bass: 18 };

export const KEY_SIGNATURES = [
  ['C major / A minor', 0], ['G major / E minor', 1], ['D major / B minor', 2],
  ['A major / F♯ minor', 3], ['E major / C♯ minor', 4], ['B major / G♯ minor', 5],
  ['F♯ major / D♯ minor', 6], ['C♯ major / A♯ minor', 7],
  ['F major / D minor', -1], ['B♭ major / G minor', -2], ['E♭ major / C minor', -3],
  ['A♭ major / F minor', -4], ['D♭ major / B♭ minor', -5],
  ['G♭ major / E♭ minor', -6], ['C♭ major / A♭ minor', -7]
].map(([name, count]) => ({ name, count }));

export function signatureAccidental(letter, count = 0) {
  return (count > 0 ? 'FCGDAEB' : 'BEADGCF').slice(0, Math.abs(count)).includes(letter) ? Math.sign(count) : 0;
}

export const staffY = step => 176 - step * 12;

export function createNote(clef, step, accidental = 0) {
  const index = BOTTOM_LINES[clef] + step;
  const letterIndex = index % LETTERS.length;
  const letter = LETTERS[letterIndex];
  const octave = Math.floor(index / LETTERS.length);
  const midi = (octave + 1) * 12 + SEMITONES[letterIndex] + accidental;
  const symbol = accidental === 1 ? '♯' : accidental === -1 ? '♭' : '';
  return { clef, step, letter, octave, accidental, pitchClass: midi % 12, name: `${letter}${symbol}${octave}`, frequency: 440 * 2 ** ((midi - 69) / 12) };
}

export const isCorrectAnswer = (note, answer) => Number.isInteger(ANSWER_PITCHES[answer]) && ANSWER_PITCHES[answer] === note.pitchClass;

export function noteForAnswer(notes, answer) {
  const pitchClass = ANSWER_PITCHES[answer];
  const matched = notes.find(note => note.pitchClass === pitchClass);
  if (matched) return matched;
  const center = notes.reduce((sum, note) => sum + 69 + 12 * Math.log2(note.frequency / 440), 0) / notes.length;
  const midi = pitchClass + 12 * Math.round((center - pitchClass) / 12);
  return { pitchClass, frequency: 440 * 2 ** ((midi - 69) / 12) };
}

export function ghostNoteForAnswer(notes, answer, mode, keySignature = null) {
  if (!notes.length || !Number.isInteger(ANSWER_PITCHES[answer])) return null;
  const { clef } = notes[0];
  const { min, max } = noteStepsForClef(clef, mode);
  const midi = note => Math.round(69 + 12 * Math.log2(note.frequency / 440));
  const center = notes.reduce((sum, note) => sum + midi(note), 0) / notes.length;
  const preferFlats = keySignature < 0 || (keySignature === null && notes.some(note => note.accidental < 0));
  const signatureMismatch = note => Number(keySignature !== null && note.accidental !== signatureAccidental(note.letter, keySignature));
  const candidates = Array.from({ length: max - min + 1 }, (_, index) => min + index)
    .flatMap(step => [-1, 0, 1].map(accidental => createNote(clef, step, accidental)))
    .filter(note => isCorrectAnswer(note, answer));

  // Keep the ghost near the exercise, using the active key's spelling when possible.
  return candidates.sort((a, b) =>
    Math.abs(midi(a) - center) - Math.abs(midi(b) - center)
    || signatureMismatch(a) - signatureMismatch(b)
    || Math.abs(a.accidental) - Math.abs(b.accidental)
    || (preferFlats ? a.accidental - b.accidental : b.accidental - a.accidental)
  )[0] || null;
}

export function ledgerSteps(step) {
  const steps = [];
  for (let line = -2; line >= step; line -= 2) steps.push(line);
  for (let line = 10; line <= step; line += 2) steps.push(line);
  return steps;
}

export function createChord(root, quality) {
  const intervals = quality === 'minor' ? [0, 3, 7] : [0, 4, 7];
  const notes = intervals.map((interval, index) => {
    const natural = createNote(root.clef, root.step + index * 2);
    const accidental = (root.pitchClass + interval - natural.pitchClass + 18) % 12 - 6;
    return Math.abs(accidental) <= 1 ? createNote(root.clef, natural.step, accidental) : null;
  });
  // Keep chord spellings within single sharps and flats.
  if (notes.some(note => !note)) return null;
  return { clef: root.clef, notes, quality, name: notes.map(note => note.name).join(', ') };
}

export function createDeck(mode, random = Math.random, includeChords = false, keySignature = null) {
  const clefs = mode === 'mixed' ? ['treble', 'bass'] : [mode];
  const deck = clefs.flatMap(clef => {
    const { min, max } = noteStepsForClef(clef, mode);
    return Array.from({ length: max - min + 1 }, (_, i) => {
      const note = createNote(clef, min + i);
      if (keySignature !== null) return [createNote(clef, note.step, signatureAccidental(note.letter, keySignature))];
      return [note, createNote(clef, note.step, 1), createNote(clef, note.step, -1)];
    }).flat();
  });
  if (includeChords) {
    const chords = deck.filter(note => note.step + 4 <= noteStepsForClef(note.clef, mode).max)
      .flatMap(root => ['major', 'minor'].map(quality => createChord(root, quality)))
      .filter(Boolean);
    deck.push(...chords);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function describePosition(step) {
  if (step < 0) return `${Math.abs(step)} staff step${step === -1 ? '' : 's'} below the bottom line`;
  if (step > 8) return `${step - 8} staff step${step === 9 ? '' : 's'} above the top line`;
  return step % 2 === 0 ? `line ${step / 2 + 1} from the bottom` : `space ${(step + 1) / 2} from the bottom`;
}

export function layoutNoteHistory(notes, nextNotes = [], includeChords = false) {
  const upcoming = Array.isArray(nextNotes) ? nextNotes : nextNotes ? [nextNotes] : [];
  const sequence = [...notes, ...upcoming];
  const hasChords = includeChords || sequence.some(note => note.notes?.length > 1);
  const spacing = hasChords ? 112 : 80;
  const positions = sequence.map((note, index) => ({ note, index, x: (hasChords ? 265 : 205) + index * spacing }));
  // Align questions across both staves, with a measure boundary to reset accidentals.
  const accidentalWidth = hasChords ? 82 : 54;
  const barlines = positions.slice(0, -1).map(position => position.x + (22 + spacing - accidentalWidth) / 2);
  return {
    spacing,
    positions: positions.slice(0, notes.length),
    preview: upcoming.length ? positions[notes.length] : null,
    previews: positions.slice(notes.length),
    barlines,
    width: Math.max(400, (positions.at(-1)?.x || 0) + 80)
  };
}

