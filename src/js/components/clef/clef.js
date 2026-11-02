import { ANSWER_PITCHES, KEYBOARD_ANSWERS, MIDDLE_C_STEPS, NOTE_STEPS, createDeck, describePosition, isCorrectAnswer, layoutNoteHistory, ledgerSteps, noteForAnswer, staffY } from './notes.js';
import Piano from './piano.js';
import ControlHints from './control-hints.js';
import { KEY_SIGNATURES, signatureAccidental } from './notes.js';

const BEST_KEY = 'clef-best-streak';
const ADVANCE_DELAY = 450;
const CHALLENGE_LENGTH = 10;
const MAX_WRONG_ATTEMPTS = 3;
// Keep the outer ledger lines and accidentals inside each staff's row.
const STAFF_TOP = staffY(NOTE_STEPS.max) - 48;
const STAFF_HEIGHT = staffY(NOTE_STEPS.min) - STAFF_TOP + 48;
const BASS_STAFF_OFFSET = staffY(MIDDLE_C_STEPS.treble) - staffY(MIDDLE_C_STEPS.bass);
const STAFF_INSET = 12;
const SCORE_INSET = 300;
const CLEF_MODES = ['mixed', 'treble', 'bass'];
const CLEF_LABELS = { mixed: 'Both clefs', treble: 'Treble clef', bass: 'Bass clef' };
const NOTATION = {
  treble: new URL('../../../img/clef/treble.svg#glyph', import.meta.url).href,
  bass: new URL('../../../img/clef/bass.svg#glyph', import.meta.url).href,
  notehead: new URL('../../../img/clef/notehead.svg#glyph', import.meta.url).href,
  sharp: new URL('../../../img/clef/sharp.svg#glyph', import.meta.url).href,
  flat: new URL('../../../img/clef/flat.svg#glyph', import.meta.url).href,
  stem: new URL('../../../img/clef/stem.svg#glyph', import.meta.url).href,
  ledger: new URL('../../../img/clef/ledger-line.svg#glyph', import.meta.url).href
};
const ACCIDENTAL_SYMBOLS = {
  1: `<use href="${NOTATION.sharp}" x="-14" y="-28" width="28" height="56"/>`,
  '-1': `<use href="${NOTATION.flat}" x="-14" y="-32" width="28" height="48"/>`
};

// Original SVGs at 24 units per staff space. The treble loop sits on G
// (y=152); the bass dots straddle F (y=104).
const CLEF_SYMBOLS = {
  treble: `<use href="${NOTATION.treble}" x="81" y="44" width="72" height="180"/>`,
  bass: `<use href="${NOTATION.bass}" x="81" y="76" width="72" height="96"/>`
};

function formatChallengeTime(milliseconds) {
  const centiseconds = Math.round(milliseconds / 10);
  const minutes = Math.floor(centiseconds / 6000);
  const seconds = String(Math.floor(centiseconds / 100) % 60).padStart(2, '0');
  const fraction = String(centiseconds % 100).padStart(2, '0');
  return `${minutes}:${seconds}.${fraction}`;
}

export default class Clef {
  constructor(element) {
    this.element = element;
    this.find = selector => element.querySelector(selector);
    this.answers = [...element.querySelectorAll('[data-answer]')];
    this.clefControl = this.find('[data-clef-mode]');
    this.hearControl = this.find('[data-hear]');
    this.includeChords = this.find('[data-include-chords]');
    this.keyPractice = this.find('[data-key-practice]');
    this.sound = this.find('[data-sound]');
    this.showHistory = this.find('[data-show-history]');
    this.challenge = this.find('[data-challenge]');
    this.challengeResult = this.find('[data-challenge-result]');
    this.statistics = this.find('[data-statistics]');
    this.staffViewport = this.find('[data-staff-viewport]');
    this.scoreScroll = this.find('[data-score-scroll]');
    this.scoreSpace = this.find('[data-score-space]');
    this.scoreTrack = this.find('[data-score-track]');
    this.scoreState = null;
    this.advanceTimer = null;
    this.resizeFrame = null;
    this.piano = new Piano(playing => this.hearControl.classList.toggle('is-playing', playing));
    this.controlHints = new ControlHints(this.find('.clef-deck'));
    this.best = this.readBest();
    this.settingsOpen = false;
    const installHelp = document.querySelector('[data-install-help]');
    this.find('[data-install-slot]').append(installHelp);
    // Keep every setting readable without relying on icon tooltips.
    this.find('.clef-deck').querySelectorAll(':scope > button, :scope > label').forEach(control => {
      const label = document.createElement('span');
      label.className = 'clef-setting-label';
      label.dataset.settingLabel = '';
      control.append(label);
    });
    this.bindEvents();
    this.startSession();
  }

  bindEvents() {
    this.find('[data-open-settings]').addEventListener('click', () => this.setSettings(!this.settingsOpen));
    this.find('[data-toggle-challenge]').addEventListener('click', () => {
      this.challenge.checked = !this.challenge.checked;
      this.startSession();
    });
    this.find('[data-toggle-install]').addEventListener('click', async () => {
      if (this.settingsTransition || this.installTransition) return;
      if (this.settingsOpen) await this.setSettings(false);
      await this.setInstallHelp(this.find('[data-install-help]').hidden);
    });
    this.find('[data-close-install]').addEventListener('click', async () => {
      await this.setInstallHelp(false);
      this.find('[data-toggle-install]').focus({ preventScroll: true });
    });
    this.answers.forEach(button => button.addEventListener('click', () => this.answer(button.dataset.answer)));
    this.clefControl.addEventListener('click', () => {
      this.clefControl.value = CLEF_MODES[(CLEF_MODES.indexOf(this.clefControl.value) + 1) % CLEF_MODES.length];
      this.startSession();
      this.clefControl.classList.add('is-changing');
    });
    this.clefControl.addEventListener('animationend', event => {
      if (event.animationName === 'clef-control-activate') this.clefControl.classList.remove('is-changing');
    });
    this.includeChords.addEventListener('change', () => this.startSession());
    this.keyPractice.addEventListener('click', () => {
      const modes = ['off', '5', '10'];
      this.keyPractice.value = modes[(modes.indexOf(this.keyPractice.value) + 1) % modes.length];
      const value = this.keyPractice.value;
      this.keyPractice.querySelector('[data-key-mode]').textContent = value === 'off' ? 'Off' : value;
      this.keyPractice.setAttribute('aria-label', value === 'off'
        ? 'Key practice off. Switch to 5 notes per key'
        : `${value} notes per key. ${value === '5' ? 'Switch to 10 notes per key' : 'Turn key practice off'}`);
      this.keyPractice.setAttribute('aria-pressed', String(value !== 'off'));
      this.startSession();
    });
    this.showHistory.addEventListener('change', () => this.drawNote());
    this.challenge.addEventListener('change', () => this.startSession(true));
    this.find('[data-challenge-again]').addEventListener('click', () => this.startSession(true));
    this.find('[data-challenge-practice]').addEventListener('click', () => {
      this.challenge.checked = false;
      this.startSession(true);
    });
    this.sound.addEventListener('change', () => {
      if (!this.sound.checked) this.piano.cancel();
    });
    this.find('[data-restart]').addEventListener('click', () => this.startSession());
    this.hearControl.addEventListener('click', () => this.playNote());
    this.scoreScroll.addEventListener('scroll', () => this.translateScore(), { passive: true });
    for (const event of ['pointerdown', 'wheel', 'keydown']) {
      this.scoreScroll.addEventListener(event, () => this.scoreTrack.classList.remove('is-animating'), { passive: true });
    }

    document.addEventListener('keydown', async event => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      if (this.settingsTransition || this.installTransition) return;
      if (event.key === 'Escape' && !this.find('[data-install-help]').hidden) {
        event.preventDefault();
        await this.setInstallHelp(false);
        this.find('[data-toggle-install]').focus({ preventScroll: true });
        return;
      }
      if (this.settingsOpen) {
        if (event.key === 'Escape') { event.preventDefault(); this.setSettings(false); }
        return;
      }
      if (event.key === 'Escape' && this.statistics.open) {
        this.closeStatistics();
        return;
      }
      const target = event.target instanceof Element ? event.target : document.activeElement;
      // Preserve native keyboard controls on settings, links, and disclosure widgets.
      if (target.closest('nav, input, select, textarea, a, summary, [contenteditable="true"]')) return;
      const answer = KEYBOARD_ANSWERS[event.key.toLowerCase()];
      if (answer && this.phase === 'question') {
        event.preventDefault();
        this.answer(answer);
      }
    });

    window.addEventListener('pagehide', () => {
      window.cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
      this.controlHints.hide();
      this.clefControl.classList.remove('is-changing');
      this.piano.close().catch(() => {});
    });
    window.addEventListener('resize', () => {
      if (!this.current || this.resizeFrame !== null) return;
      this.resizeFrame = window.requestAnimationFrame(() => {
        this.resizeFrame = null;
        this.drawNote();
      });
    });
  }

  closeStatistics() {
    this.statistics.open = false;
    this.statistics.querySelector('summary').focus({ preventScroll: true });
  }

  refreshSettingLabels() {
    this.find('.clef-deck').querySelectorAll('[data-setting-label]').forEach(label => {
      const wrapper = label.parentElement;
      const control = wrapper.matches('button') ? wrapper : wrapper.querySelector('input');
      let text = control.getAttribute('aria-label');
      if (control === this.clefControl) text = `Clef: ${CLEF_LABELS[this.mode]}`;
      if (control === this.keyPractice) text = `Key practice: ${control.value === 'off' ? 'Off' : `${control.value} notes per key`}`;
      label.textContent = text;
    });
  }

  async setInstallHelp(open) {
    const panel = this.find('[data-install-help]');
    if (this.installTransition || open === !panel.hidden) return;
    this.installTransition = true;
    const slot = this.find('[data-install-slot]');
    const oldHeight = slot.getBoundingClientRect().height;
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof panel.animate === 'function';
    const animations = [];
    this.find('[data-toggle-install]').setAttribute('aria-expanded', String(open));
    try {
      if (motion) {
        slot.style.height = `${oldHeight}px`;
        slot.classList.add('is-transitioning');
        panel.hidden = false;
        panel.inert = !open;
        const height = open ? panel.getBoundingClientRect().height : 0;
        const options = { duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' };
        const frames = [
          { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-12px)', opacity: 0 },
          { clipPath: 'inset(0)', transform: 'translateY(0)', opacity: 1 }
        ];
        animations.push(slot.animate([{ height: `${oldHeight}px` }, { height: `${height}px` }], options));
        animations.push(panel.animate(open ? frames : [...frames].reverse(), options));
        await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
      }
    } finally {
      panel.hidden = !open;
      panel.inert = !open;
      slot.classList.remove('is-transitioning');
      slot.style.removeProperty('height');
      animations.forEach(animation => animation.cancel());
      this.installTransition = false;
    }
    this.drawNote();
  }

  async setSettings(open) {
    if (this.settingsTransition || this.installTransition || open === this.settingsOpen) return;
    this.settingsTransition = true;
    if (open) await this.setInstallHelp(false);
    const stage = this.find('.clef-panel-stage');
    const menu = this.find('#clef-settings');
    const keyboard = this.find('.clef-answers');
    const incoming = open ? menu : keyboard;
    const outgoing = open ? keyboard : menu;
    const oldHeight = stage.getBoundingClientRect().height;
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof menu.animate === 'function';
    this.settingsOpen = open;
    this.find('[data-open-settings]').setAttribute('aria-expanded', String(open));
    // Reserve the feedback row so opening settings cannot change the staff's
    // available height before the panel animation starts.
    this.find('[data-feedback-row]').style.visibility = open ? 'hidden' : '';
    this.controlHints.hide();
    if (open) {
      this.settingsPausedAt = performance.now();
      window.clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
      this.piano.cancel();
      this.refreshSettingLabels();
    }

    const animations = [];
    try {
      if (motion) {
        // Fix the current height before exposing the new content. Both panels
        // then overlap without affecting layout while the stage changes size.
        stage.style.height = `${oldHeight}px`;
        stage.classList.add('is-transitioning');
        incoming.hidden = false;
        incoming.inert = false;
        outgoing.inert = true;
        const newHeight = incoming.getBoundingClientRect().height;
        const options = { duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' };
        animations.push(stage.animate([{ height: `${oldHeight}px` }, { height: `${newHeight}px` }], options));
        animations.push(incoming.animate(open ? [
          { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-12px)', opacity: 0 },
          { clipPath: 'inset(0)', transform: 'translateY(0)', opacity: 1 }
        ] : [{ opacity: 0 }, { opacity: 1 }], options));
        animations.push(outgoing.animate(open ? [{ opacity: 1 }, { opacity: 0 }] : [
          { clipPath: 'inset(0)', transform: 'translateY(0)', opacity: 1 },
          { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-12px)', opacity: 0 }
        ], options));
        await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
      }
    } finally {
      // Commit the final layout before removing animation fills, all in one
      // frame, so returning to natural height never reveals the other panel.
      outgoing.hidden = true;
      outgoing.inert = true;
      incoming.hidden = false;
      incoming.inert = false;
      stage.classList.remove('is-transitioning');
      stage.style.removeProperty('height');
      animations.forEach(animation => animation.cancel());
      this.settingsTransition = false;
    }
    if (!open && this.challenge.checked && this.phase === 'question') {
      if (this.challengeStartedAt === null) this.challengeStartedAt = performance.now();
      else this.challengeStartedAt += performance.now() - this.settingsPausedAt;
    }
    this.find('[data-open-settings]').focus({ preventScroll: true });
    if (!open && this.phase === 'answered') this.next();
    this.drawNote();
  }

  readBest() {
    try {
      const value = Number(localStorage.getItem(BEST_KEY));
      return Number.isSafeInteger(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  startSession(focus = false) {
    this.piano.cancel();
    window.clearTimeout(this.advanceTimer);
    this.advanceTimer = null;
    this.challengeStartedAt = null;
    this.challengeElapsed = null;
    this.challengeResult.hidden = true;
    this.find('[data-challenge-progress]').hidden = !this.challenge.checked;
    const challengeUnit = this.includeChords.checked ? 'exercise' : 'note';
    this.challenge.setAttribute('aria-label', `${CHALLENGE_LENGTH}-${challengeUnit} timed challenge`);
    this.find('[data-toggle-challenge]').setAttribute('aria-label', `${CHALLENGE_LENGTH}-${challengeUnit} timed challenge`);
    this.find('[data-toggle-challenge]').setAttribute('aria-pressed', String(this.challenge.checked));
    this.find('[data-restart]').setAttribute('aria-label', this.challenge.checked ? 'Restart challenge' : 'Restart session');
    this.mode = this.clefControl.value;
    const nextClef = CLEF_MODES[(CLEF_MODES.indexOf(this.mode) + 1) % CLEF_MODES.length];
    this.clefControl.setAttribute('aria-label', `${CLEF_LABELS[this.mode]}. Switch to ${CLEF_LABELS[nextClef].toLowerCase()}`);
    this.clefControl.querySelectorAll('[data-clef-option]').forEach(icon => icon.toggleAttribute('hidden', icon.dataset.clefOption !== this.mode));
    this.deck = [];
    this.keyIndex = Math.floor(Math.random() * KEY_SIGNATURES.length);
    this.keyRound = -1;
    this.current = null;
    this.upcoming = null;
    this.history = [];
    this.scoreState = null;
    this.completed = 0;
    this.skipped = 0;
    this.correct = 0;
    this.attempts = 0;
    this.streak = 0;
    this.find('[data-completed-label]').textContent = this.includeChords.checked ? 'Exercises completed' : 'Notes completed';
    this.find('[data-skipped-label]').textContent = this.includeChords.checked ? 'Exercises skipped' : 'Notes skipped';
    this.find('[data-streak-unit]').textContent = this.includeChords.checked ? ' exercises' : ' notes';
    this.updateStats();
    this.refreshSettingLabels();
    this.showQuestion(focus);
  }

  takeExercise(previous = null) {
    if (!this.deck.length) {
      this.deck = createDeck(this.mode, Math.random, this.includeChords.checked, this.keyPractice.value === 'off' ? null : KEY_SIGNATURES[this.keyIndex].count);
      const candidate = this.deck[this.deck.length - 1];
      if (previous && candidate.name === previous.name && candidate.clef === previous.clef) {
        [this.deck[0], this.deck[this.deck.length - 1]] = [candidate, this.deck[0]];
      }
    }
    const exercise = this.deck.pop();
    return { ...exercise, notes: exercise.notes || [exercise] };
  }

  showQuestion(focus = false) {
    const perKey = Number(this.keyPractice.value) || 0;
    const answered = this.completed + this.skipped;
    const round = perKey ? Math.floor(answered / perKey) : 0;
    if (perKey && round !== this.keyRound) {
      if (this.keyRound >= 0) this.keyIndex = (this.keyIndex + 1 + Math.floor(Math.random() * (KEY_SIGNATURES.length - 1))) % KEY_SIGNATURES.length;
      this.keyRound = round;
      this.deck = [];
      this.current = this.upcoming = null;
      this.history = [];
      this.scoreState = null;
    }
    this.find('[data-key-status]').textContent = perKey
      ? `${KEY_SIGNATURES[this.keyIndex].name} · ${answered % perKey + 1} / ${perKey}${this.includeChords.checked ? ' exercises' : ' notes'}` : '';
    if (this.current) this.history.push(this.current);
    this.current = this.upcoming || this.takeExercise();
    const lastQuestion = this.challenge.checked && this.completed + this.skipped + 1 === CHALLENGE_LENGTH;
    this.upcoming = lastQuestion || (perKey && (answered + 1) % perKey === 0) ? null : this.takeExercise(this.current);
    this.matchedPitches = new Set();
    this.wrongAttempts = 0;
    this.phase = 'question';
    const chord = this.current.notes.length > 1;
    this.find('[data-feedback]').textContent = chord ? `Choose all ${this.current.notes.length} notes.` : '';
    this.find('[data-feedback-row]').removeAttribute('data-state');
    this.find('[data-hear]').setAttribute('aria-label', `Hear the current ${chord ? 'chord' : 'note'}`);
    this.controlHints.refresh();
    this.find('.clef-answers').setAttribute('aria-label', chord ? 'Choose all the notes in the chord' : 'Choose the piano key that matches the note');
    this.answers.forEach(button => {
      button.disabled = false;
      button.classList.remove('is-correct', 'is-wrong');
      if (chord) button.setAttribute('aria-pressed', 'false');
      else button.removeAttribute('aria-pressed');
    });
    this.drawNote();
    if (this.challenge.checked && this.challengeStartedAt === null && !this.settingsOpen) this.challengeStartedAt = performance.now();
    if (focus && !this.settingsOpen) this.answers[0].focus({ preventScroll: true });
  }

  exerciseMarkup({ notes }, x, showMatches = false) {
    const steps = notes.map(note => note.step);
    const bottom = staffY(Math.min(...steps));
    const top = staffY(Math.max(...steps));
    const stemUp = (Math.min(...steps) + Math.max(...steps)) / 2 < 4;
    const stemX = stemUp ? x + 14 : x - 14;
    const stemTop = stemUp ? top - 62 : top + 2;
    const stemHeight = bottom - top + 60;
    const ledgers = [...new Set(steps.flatMap(ledgerSteps))]
      .map(line => `<use href="${NOTATION.ledger}" x="${x - 22}" y="${staffY(line) - 1}" width="44" height="2"/>`).join('');
    const accidentalColumns = [];
    const heads = [...notes].sort((a, b) => b.step - a.step).map(note => {
      const y = staffY(note.step);
      let symbol = '';
      const signature = this.keyPractice.value === 'off' ? 0 : signatureAccidental(note.letter, KEY_SIGNATURES[this.keyIndex].count);
      if (note.accidental !== signature) {
        let column = accidentalColumns.findIndex(positions => positions.every(previousY => Math.abs(y - previousY) >= 48));
        if (column === -1) { column = accidentalColumns.length; accidentalColumns.push([]); }
        accidentalColumns[column].push(y);
        symbol = `<g data-accidental="${note.accidental}" transform="translate(${x - 40 - column * 28} ${y})">${ACCIDENTAL_SYMBOLS[note.accidental] || '<text x="-10" y="12" font-size="40">♮</text>'}</g>`;
      }
      const matched = showMatches && this.matchedPitches.has(note.pitchClass);
      return `<g data-note-pitch="${note.pitchClass}" data-step="${note.step}" data-accidental="${note.accidental}"${matched ? ' class="clef-staff__matched"' : ''}>${symbol}<use data-notehead href="${NOTATION.notehead}" x="${x - 17}" y="${y - 14}" width="34" height="28"/></g>`;
    }).join('');
    return `${ledgers}<g transform="translate(${stemX - 1} ${stemTop}) scale(1 ${stemHeight / 64})"><use data-stem href="${NOTATION.stem}" width="2" height="64"/></g>${heads}`;
  }

  drawNote() {
    const { clef } = this.current;
    const svg = this.find('[data-staff]');
    const showHistory = this.showHistory.checked;
    const dual = this.mode === 'mixed';
    const clefs = dual ? ['treble', 'bass'] : [this.mode];
    const rowOffset = noteClef => dual && noteClef === 'bass' ? BASS_STAFF_OFFSET : 0;
    const height = STAFF_HEIGHT + (dual ? BASS_STAFF_OFFSET : 0);
    this.find('.clef-staff').classList.toggle('clef-staff--history', showHistory);
    this.find('.clef-staff').classList.toggle('clef-staff--dual', dual);
    svg.style.setProperty('--staff-height-units', height);
    // Fit the notation canvas to the viewport at a uniform scale, extending
    // the staff horizontally without widening the clefs or noteheads.
    const renderedHeight = svg.getBoundingClientRect().height || height;
    const viewportWidth = this.staffViewport.getBoundingClientRect().width || 560;
    const width = Math.max(560, viewportWidth * height / renderedHeight);
    const layout = showHistory ? layoutNoteHistory([...this.history, this.current], this.upcoming, this.includeChords.checked) : null;
    if (layout) {
      layout.positions.forEach(position => { position.x += 140; });
      if (layout.preview) layout.preview.x += 140;
      layout.barlines = layout.barlines.map(x => x + 140);
      layout.width += 140;
    }
    const right = width - STAFF_INSET;
    svg.setAttribute('viewBox', `0 ${STAFF_TOP} ${width} ${height}`);
    const clip = this.find('[data-score-clip]');
    clip.setAttribute('x', SCORE_INSET);
    clip.setAttribute('width', width - SCORE_INSET);
    clip.setAttribute('height', height + 160);
    const staffLines = `<path d="${[80, 104, 128, 152, 176].map(y => `M${STAFF_INSET} ${y}H${right}`).join(' ')} M${STAFF_INSET} 80V176 M${right} 80V176"/>`;
    this.find('[data-staff-lines]').innerHTML = clefs.map(staffClef => `<g data-staff-row="${staffClef}" transform="translate(0 ${rowOffset(staffClef)})">${staffLines}</g>`).join('');
    this.find('[data-clef-symbol]').innerHTML = clefs.map(staffClef => `<g data-clef="${staffClef}" transform="translate(0 ${rowOffset(staffClef)})">${CLEF_SYMBOLS[staffClef]}</g>`).join('');
    if (this.keyPractice.value !== 'off') {
      const { count } = KEY_SIGNATURES[this.keyIndex];
      const steps = count > 0 ? [8, 5, 9, 6, 3, 7, 4] : [4, 7, 3, 6, 2, 5, 1];
      this.find('[data-clef-symbol]').innerHTML += clefs.map(staffClef => `<g transform="translate(0 ${rowOffset(staffClef)})">${steps.slice(0, Math.abs(count)).map((step, index) => `<g transform="translate(${165 + index * 17} ${staffY(step - (staffClef === 'bass' ? 2 : 0))})">${ACCIDENTAL_SYMBOLS[Math.sign(count)]}</g>`).join('')}</g>`).join('');
    }
    this.find('[data-history-notes]').innerHTML = layout
      ? layout.positions.slice(0, -1).map(position => `<g class="clef-staff__past" data-history-note data-clef="${position.note.clef}" transform="translate(0 ${rowOffset(position.note.clef)})">${this.exerciseMarkup(position.note, position.x)}</g>`).join('')
        + `<g class="clef-staff__past" stroke="currentColor" stroke-width="1">${clefs.map(staffClef => layout.barlines.map(x => `<path d="M${x} ${80 + rowOffset(staffClef)}V${176 + rowOffset(staffClef)}"/>`).join('')).join('')}</g>`
      : '';
    this.find('[data-note]').setAttribute('transform', `translate(0 ${rowOffset(clef)})`);
    this.find('[data-note]').setAttribute('data-clef', clef);
    this.find('[data-note]').innerHTML = this.exerciseMarkup(this.current, layout?.positions.at(-1).x || Math.max(405, width / 2), true);
    const preview = this.find('[data-next-note]');
    if (layout?.preview) {
      preview.setAttribute('transform', `translate(0 ${rowOffset(this.upcoming.clef)})`);
      preview.setAttribute('data-clef', this.upcoming.clef);
      preview.innerHTML = this.exerciseMarkup(this.upcoming, layout.preview.x);
    } else {
      preview.innerHTML = '';
      preview.removeAttribute('data-clef');
    }
    const describeExercise = exercise => {
      const positions = exercise.notes.map(({ step, accidental }) => `${accidental === 1 ? 'sharp' : accidental === -1 ? 'flat' : 'natural'} note on ${describePosition(step)}`).join('; ');
      return `${exercise.clef === 'treble' ? 'Treble' : 'Bass'} clef: ${exercise.notes.length > 1 ? 'chord, ' : ''}${positions}.`;
    };
    const description = describeExercise(this.current);
    const nextNote = showHistory && this.upcoming ? ` Next: ${describeExercise(this.upcoming)}` : '';
    const pastNotes = showHistory && this.history.length
      ? ` Previous notes: ${this.history.map(note => `${note.clef} ${note.name}`).join(', ')}.` : '';
    const keyDescription = this.keyPractice.value === 'off' ? '' : ` Key signature: ${KEY_SIGNATURES[this.keyIndex].name}.`;
    svg.setAttribute('aria-label', description + keyDescription + (dual ? ' Treble staff above bass staff.' : '') + pastNotes + nextNote);
    this.scrollHistory(layout, width, viewportWidth);
  }

  scrollHistory(layout, width, viewportWidth) {
    this.scoreScroll.hidden = !layout;
    if (!layout) {
      this.scoreState = null;
      this.scoreTrack.classList.remove('is-animating');
      this.scoreTrack.style.transform = 'translateX(0px)';
      this.scoreScroll.scrollLeft = 0;
      return;
    }
    const scale = viewportWidth / width;
    const leading = Math.max(405, width / 2) - layout.positions[0].x;
    const key = `${this.mode}:${width.toFixed(2)}:${scale.toFixed(5)}:${layout.spacing}`;
    const reset = this.scoreState?.key !== key;
    const previousScroll = this.scoreScroll.scrollLeft;
    this.scoreSpace.style.width = `${viewportWidth + this.history.length * layout.spacing * scale}px`;
    this.scoreState = { key, scale, leading };
    this.scoreScroll.scrollLeft = this.scoreScroll.scrollWidth;
    if (reset) this.scoreTrack.classList.remove('is-animating');
    else if (Math.abs(previousScroll - this.scoreScroll.scrollLeft) > 0.5) this.scoreTrack.classList.add('is-animating');
    this.translateScore();
  }

  translateScore() {
    if (!this.scoreState) return;
    const { leading, scale } = this.scoreState;
    this.scoreTrack.style.transform = `translateX(${leading - this.scoreScroll.scrollLeft / scale}px)`;
  }

  answer(value) {
    if (this.settingsOpen || this.settingsTransition) return;
    if (this.phase !== 'question' || !Number.isInteger(ANSWER_PITCHES[value])) return;
    const pitch = ANSWER_PITCHES[value];
    if (this.matchedPitches.has(pitch)) return;
    const hadAnswerFocus = this.answers.includes(document.activeElement);
    const isCorrect = this.current.notes.some(note => isCorrectAnswer(note, value));
    this.attempts += 1;
    if (isCorrect) { this.matchedPitches.add(pitch); this.correct += 1; }
    else this.wrongAttempts += 1;
    const complete = this.matchedPitches.size === this.current.notes.length;
    const exhausted = this.wrongAttempts === MAX_WRONG_ATTEMPTS;
    const answered = complete || exhausted;
    if (answered) {
      this.phase = 'answered';
      if (complete) this.completed += 1;
      else this.skipped += 1;
      if (this.challenge.checked && this.completed + this.skipped === CHALLENGE_LENGTH) {
        this.challengeElapsed = performance.now() - this.challengeStartedAt;
      }
    }
    if (!isCorrect) this.streak = 0;
    else if (complete) this.streak += 1;
    if (this.streak > this.best) {
      this.best = this.streak;
      try { localStorage.setItem(BEST_KEY, String(this.best)); } catch { /* Practice also works without storage. */ }
    }

    this.answers.forEach(button => {
      const matched = this.matchedPitches.has(ANSWER_PITCHES[button.dataset.answer]);
      const revealed = exhausted && this.current.notes.some(note => isCorrectAnswer(note, button.dataset.answer));
      button.disabled = answered || matched;
      button.classList.toggle('is-correct', matched || revealed);
      button.classList.toggle('is-wrong', !isCorrect && ANSWER_PITCHES[button.dataset.answer] === pitch);
      if (this.current.notes.length > 1) button.setAttribute('aria-pressed', String(matched));
    });
    this.find('[data-feedback-row]').dataset.state = isCorrect ? 'correct' : 'wrong';
    const remaining = MAX_WRONG_ATTEMPTS - this.wrongAttempts;
    this.find('[data-feedback]').textContent = exhausted
      ? `Answer: ${this.current.name}.`
      : isCorrect
        ? complete ? `Correct: ${this.current.name}.` : `${this.matchedPitches.size} of ${this.current.notes.length} notes found.`
        : `Try again. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`;
    this.updateStats();
    // Keep focus in practice when a found note disables its piano key.
    if ((isCorrect || exhausted) && hadAnswerFocus) this.find('#practice').focus({ preventScroll: true });
    this.drawNote();
    if (this.sound.checked) {
      const notes = complete || this.current.notes.length === 1
        ? this.current.notes
        : [noteForAnswer(this.current.notes, value)];
      this.playNote(notes);
    }
    if (answered) {
      if (this.challenge.checked && complete && this.completed + this.skipped === CHALLENGE_LENGTH) {
        this.finishChallenge();
        return;
      }
      this.advanceTimer = window.setTimeout(() => {
        const focus = document.activeElement === this.find('#practice');
        this.next(focus);
      }, this.challenge.checked && complete ? 0 : ADVANCE_DELAY);
    }
  }

  finishChallenge() {
    this.phase = 'finished';
    window.clearTimeout(this.advanceTimer);
    this.advanceTimer = null;
    const unit = this.includeChords.checked ? 'exercises' : 'notes';
    const result = this.skipped
      ? `${this.completed} of ${CHALLENGE_LENGTH} ${unit} correct`
      : `${CHALLENGE_LENGTH} ${unit} completed`;
    this.find('[data-challenge-title]').textContent = result;
    this.find('[data-challenge-time]').textContent = formatChallengeTime(this.challengeElapsed);
    this.find('[data-feedback]').textContent = this.skipped
      ? `${this.completed} correct · ${this.skipped} skipped · ${(this.challengeElapsed / 1000).toFixed(2)}s`
      : `${CHALLENGE_LENGTH} ${unit} in ${(this.challengeElapsed / 1000).toFixed(2)} seconds.`;
    this.statistics.open = false;
    this.challengeResult.hidden = false;
    this.find('[data-challenge-again]').focus({ preventScroll: true });
  }

  next(focus = false) {
    if (this.settingsOpen) return;
    if (this.phase !== 'answered') return;
    window.clearTimeout(this.advanceTimer);
    this.advanceTimer = null;
    if (this.challenge.checked && this.completed + this.skipped === CHALLENGE_LENGTH) {
      this.finishChallenge();
      return;
    }
    this.showQuestion(focus);
  }

  updateStats() {
    this.find('[data-completed]').textContent = this.completed;
    this.find('[data-skipped]').textContent = this.skipped;
    this.find('[data-accuracy]').textContent = this.attempts ? `${Math.round(this.correct / this.attempts * 100)}%` : '—';
    this.find('[data-streak]').textContent = this.streak;
    this.find('[data-best]').textContent = this.best;
    this.find('[data-challenge-progress]').textContent = `${this.completed + this.skipped} / ${CHALLENGE_LENGTH}`;
  }

  async playNote(notes = this.current.notes) {
    const exercise = this.current;
    try {
      await this.piano.play(notes);
    } catch {
      if (this.current === exercise) {
        this.find('[data-feedback]').textContent = 'Piano sound couldn’t start. Try Hear note again, or keep practicing silently.';
      }
    }
  }
}
