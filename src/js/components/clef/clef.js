import { ANSWER_PITCHES, KEYBOARD_ANSWERS, MIDDLE_C_STEPS, NOTE_STEPS, createDeck, describePosition, ghostNoteForAnswer, isCorrectAnswer, layoutNoteHistory, ledgerSteps, noteForAnswer, staffY } from './notes.js';
import Piano from './piano.js';
import ControlHints from './control-hints.js';
import { applyTheme } from '../theme.js';
import { KEY_SIGNATURES, signatureAccidental } from './notes.js';

const BEST_KEY = 'clef-best-streak';
const ADVANCE_DELAY = 450;
const CHALLENGE_LENGTH = 10;
const MAX_WRONG_ATTEMPTS = 3;
const PREVIEW_COUNT = 12;
// Keep the outer ledger lines and accidentals inside each staff's row.
const STAFF_TOP = staffY(NOTE_STEPS.max) - 48;
const STAFF_HEIGHT = staffY(NOTE_STEPS.min) - STAFF_TOP + 48;
const BASS_STAFF_OFFSET = staffY(MIDDLE_C_STEPS.treble) - staffY(MIDDLE_C_STEPS.bass);
const SCORE_END_SPACE = 12;
const SCORE_INSET = 180;
const CLEF_X = 24;
const CLEF_DIVIDER_X = 116;
const SETTING_VALUES = { theme: ['light', 'dark'], clef: ['mixed', 'treble', 'bass'], keys: ['off', '5', '10'], sound: ['off', 'on'], chords: ['off', 'on'], history: ['single', 'scrolling'], ghosts: ['off', 'on'] };
const NOTATION = {
  treble: new URL('../../../img/clef/treble.svg#glyph', import.meta.url).href,
  bass: new URL('../../../img/clef/bass.svg#glyph', import.meta.url).href,
  notehead: new URL('../../../img/clef/notehead.svg#glyph', import.meta.url).href,
  sharp: new URL('../../../img/clef/sharp.svg#glyph', import.meta.url).href,
  flat: new URL('../../../img/clef/flat.svg#glyph', import.meta.url).href,
  natural: new URL('../../../img/clef/natural.svg#glyph', import.meta.url).href,
  stem: new URL('../../../img/clef/stem.svg#glyph', import.meta.url).href,
  ledger: new URL('../../../img/clef/ledger-line.svg#glyph', import.meta.url).href
};
const ACCIDENTAL_SYMBOLS = {
  0: `<use href="${NOTATION.natural}" x="-14" y="-28" width="28" height="56"/>`,
  1: `<use href="${NOTATION.sharp}" x="-14" y="-28" width="28" height="56"/>`,
  '-1': `<use href="${NOTATION.flat}" x="-14" y="-32" width="28" height="48"/>`
};

// Original SVGs at 24 units per staff space. The treble loop sits on G
// (y=152); the bass dots straddle F (y=104).
const CLEF_SYMBOLS = {
  treble: `<use href="${NOTATION.treble}" x="${CLEF_X}" y="44" width="72" height="180"/>`,
  bass: `<use href="${NOTATION.bass}" x="${CLEF_X}" y="80" width="72" height="96"/>`
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
    this.showGhosts = this.find('[data-show-ghosts]');
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
    this.controlHints = new ControlHints(this.find('.clef-piano'));
    this.best = this.readBest();
    this.practicePanel = null;
    const installHelp = document.querySelector('[data-install-help]');
    this.find('[data-install-slot]').append(installHelp);
    this.settingBars = [...element.querySelectorAll('.clef-setting-options')];
    this.settingBars.forEach(bar => {
      bar.style.setProperty('--option-count', bar.querySelectorAll('[data-setting]').length);
    });
    this.bindEvents();
    this.startSession();
  }

  bindEvents() {
    this.element.querySelectorAll('[data-setting]').forEach(button => {
      button.addEventListener('click', () => this.setSetting(button.dataset.setting, button.value));
      button.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') this.moveSettingRect(button.parentElement, button);
      });
      button.addEventListener('focus', () => this.moveSettingRect(button.parentElement, button));
    });
    this.settingBars.forEach(bar => {
      bar.addEventListener('pointerleave', () => this.moveSettingRect(bar,
        bar.contains(document.activeElement) ? document.activeElement : null));
      bar.addEventListener('focusout', event => this.moveSettingRect(bar,
        bar.contains(event.relatedTarget) ? event.relatedTarget : null));
    });
    this.find('[data-open-settings]').addEventListener('click', () => this.setSettings(!this.settingsOpen));
    this.find('[data-open-statistics]').addEventListener('click', () => this.setStatistics(!this.statisticsOpen));
    this.find('[data-toggle-challenge]').addEventListener('click', () => {
      this.challenge.checked = !this.challenge.checked;
      this.startSession();
    });
    this.find('[data-toggle-install]').addEventListener('click', async () => {
      if (this.settingsTransition || this.installTransition) return;
      if (this.practicePanel) await this.setPracticePanel(null);
      await this.setInstallHelp(this.find('[data-install-help]').hidden);
    });
    this.answers.forEach(button => button.addEventListener('click', () => this.answer(button.dataset.answer)));
    this.challenge.addEventListener('change', () => this.startSession(true));
    this.find('[data-challenge-again]').addEventListener('click', () => this.startSession(true));
    this.find('[data-challenge-practice]').addEventListener('click', () => {
      this.challenge.checked = false;
      this.startSession(true);
    });
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
      if (this.practicePanel) {
        if (event.key === 'Escape') { event.preventDefault(); this.setPracticePanel(null); }
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

  get settingsOpen() {
    return this.practicePanel === 'settings';
  }

  get statisticsOpen() {
    return this.practicePanel === 'statistics';
  }

  settingValues() {
    return { theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', clef: this.clefControl.value, keys: this.keyPractice.value, sound: this.sound.checked ? 'on' : 'off', chords: this.includeChords.checked ? 'on' : 'off', history: this.showHistory.checked ? 'scrolling' : 'single', ghosts: this.showGhosts.checked ? 'on' : 'off' };
  }

  syncSettings() {
    const values = this.settingValues();
    this.element.querySelectorAll('[data-setting]').forEach(button => {
      button.setAttribute('aria-pressed', String(values[button.dataset.setting] === button.value));
    });
    this.settingBars.forEach(bar => this.moveSettingRect(bar));
  }

  moveSettingRect(bar, target = null) {
    const options = [...bar.querySelectorAll('[data-setting]')];
    const selected = target || bar.querySelector('[aria-pressed="true"]');
    const index = options.indexOf(selected);
    if (index >= 0) bar.style.setProperty('--option-index', index);
  }

  setSetting(setting, value) {
    if (!SETTING_VALUES[setting]?.includes(value) || this.settingValues()[setting] === value) return;
    if (setting === 'theme') applyTheme(value);
    if (setting === 'clef') this.clefControl.value = value;
    if (setting === 'keys') this.keyPractice.value = value;
    if (setting === 'sound') { this.sound.checked = value === 'on'; if (!this.sound.checked) this.piano.cancel(); }
    if (setting === 'chords') this.includeChords.checked = value === 'on';
    if (setting === 'history') this.showHistory.checked = value === 'scrolling';
    if (setting === 'ghosts') {
      this.showGhosts.checked = value === 'on';
      if (!this.showGhosts.checked) this.ghostNote = null;
    }
    this.syncSettings();
    if (['clef', 'keys', 'chords'].includes(setting)) this.startSession();
    else if (['history', 'ghosts'].includes(setting)) this.drawNote();
  }

  async setInstallHelp(open) {
    const panel = this.find('[data-install-help]');
    if (this.installTransition || open === !panel.hidden) return;
    this.installTransition = true;
    const slot = this.find('[data-install-slot]');
    this.find('[data-toggle-install]').setAttribute('aria-expanded', String(open));
    try {
      await this.slidePanel(slot, panel, open);
    } finally {
      this.installTransition = false;
    }
    this.drawNote();
  }

  async slidePanel(slot, panel, open) {
    const instrument = this.find('.clef-instrument');
    if (open && !instrument.classList.contains('clef-instrument--panel-open')) {
      // Keep the sheet and toolbar anchored while the piano grows for a menu.
      instrument.style.setProperty('--clef-sheet-height', `${this.find('.clef-staff').getBoundingClientRect().height}px`);
      const pianoTop = this.find('.clef-piano').getBoundingClientRect().top;
      const toolbarTop = this.find('.clef-settings-bar').getBoundingClientRect().top;
      instrument.style.setProperty('--clef-toolbar-offset', `${toolbarTop - pianoTop}px`);
      instrument.classList.add('clef-instrument--panel-open');
    }
    const oldHeight = slot.getBoundingClientRect().height;
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof panel.animate === 'function';
    const animations = [];
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
      if (!this.practicePanel && this.find('[data-install-help]').hidden) {
        instrument.classList.remove('clef-instrument--panel-open');
        instrument.style.removeProperty('--clef-sheet-height');
        instrument.style.removeProperty('--clef-toolbar-offset');
      }
    }
  }

  setSettings(open) {
    return this.setPracticePanel(open ? 'settings' : null);
  }

  setStatistics(open) {
    return this.setPracticePanel(open ? 'statistics' : null);
  }

  async setPracticePanel(panel) {
    if (this.settingsTransition || this.installTransition || panel === this.practicePanel) return;
    this.settingsTransition = true;
    const previous = this.practicePanel;
    const open = panel !== null;
    if (open) await this.setInstallHelp(false);
    const panels = {
      settings: { slot: this.find('.clef-settings-slot'), menu: this.find('#clef-settings'), button: this.find('[data-open-settings]') },
      statistics: { slot: this.find('.clef-statistics-slot'), menu: this.statistics, button: this.find('[data-open-statistics]') }
    };
    const keyboard = this.find('.clef-answers');
    this.practicePanel = panel;
    panels.settings.button.setAttribute('aria-expanded', String(this.settingsOpen));
    panels.statistics.button.setAttribute('aria-expanded', String(this.statisticsOpen));
    // Reserve the feedback row so opening a panel cannot change the staff's
    // available height before the panel animation starts.
    this.find('[data-feedback-row]').style.visibility = open ? 'hidden' : '';
    this.controlHints.hide();
    if (open && !previous) {
      this.settingsPausedAt = performance.now();
      window.clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
      this.piano.cancel();
    }
    if (this.settingsOpen) this.syncSettings();

    try {
      keyboard.inert = open;
      // Both menus expand in normal flow using the same pull-down animation.
      if (previous) await this.slidePanel(panels[previous].slot, panels[previous].menu, false);
      if (panel) await this.slidePanel(panels[panel].slot, panels[panel].menu, true);
    } finally {
      this.settingsTransition = false;
    }
    if (!open && this.challenge.checked && this.phase === 'question') {
      if (this.challengeStartedAt === null) this.challengeStartedAt = performance.now();
      else this.challengeStartedAt += performance.now() - this.settingsPausedAt;
    }
    panels[panel || previous].button.focus({ preventScroll: true });
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
    this.mode = this.clefControl.value;
    this.deck = [];
    this.keyIndex = Math.floor(Math.random() * KEY_SIGNATURES.length);
    this.keyRound = -1;
    this.current = null;
    this.upcoming = null;
    this.previewQueue = [];
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
    this.syncSettings();
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
      this.previewQueue = [];
      this.history = [];
      this.scoreState = null;
    }
    this.find('[data-key-status]').textContent = perKey
      ? `${KEY_SIGNATURES[this.keyIndex].name} · ${answered % perKey + 1} / ${perKey}${this.includeChords.checked ? ' exercises' : ' notes'}` : '';
    if (this.current) this.history.push(this.current);
    this.current = this.previewQueue.shift() || this.takeExercise();
    const remaining = Math.min(
      PREVIEW_COUNT,
      this.challenge.checked ? CHALLENGE_LENGTH - answered - 1 : Infinity,
      perKey ? perKey - answered % perKey - 1 : Infinity
    );
    while (this.previewQueue.length < remaining) {
      this.previewQueue.push(this.takeExercise(this.previewQueue.at(-1) || this.current));
    }
    this.upcoming = this.previewQueue[0] || null;
    this.matchedPitches = new Set();
    this.ghostNote = null;
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
    if (this.challenge.checked && this.challengeStartedAt === null && !this.practicePanel) this.challengeStartedAt = performance.now();
    if (focus && !this.practicePanel) this.answers[0].focus({ preventScroll: true });
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
        symbol = `<g data-accidental="${note.accidental}" transform="translate(${x - 40 - column * 28} ${y})">${ACCIDENTAL_SYMBOLS[note.accidental]}</g>`;
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
    // Size the staves by the available sheet height. Reserve enough width for
    // the current exercise and one preview without shrinking to a long canvas.
    const renderedHeight = svg.getBoundingClientRect().height || height;
    const viewportWidth = this.staffViewport.getBoundingClientRect().width || 560;
    const signatureCount = this.keyPractice.value === 'off' ? 0 : Math.abs(KEY_SIGNATURES[this.keyIndex].count);
    const scoreInset = Math.max(SCORE_INSET, signatureCount ? 165 + (signatureCount - 1) * 17 + 28 : 0);
    const currentX = scoreInset + (this.includeChords.checked ? 90 : 58);
    const ghostExercise = this.showGhosts.checked && this.ghostNote
      ? { clef: this.ghostNote.clef, notes: [this.ghostNote], name: this.ghostNote.name }
      : null;
    const previews = ghostExercise ? [ghostExercise, ...this.previewQueue] : this.previewQueue;
    const layout = showHistory ? layoutNoteHistory([...this.history, this.current], previews, this.includeChords.checked) : null;
    const ghostSpacing = this.includeChords.checked ? 112 : 80;
    const minimumWidth = currentX + Math.max(layout ? layout.spacing : 0, this.showGhosts.checked ? ghostSpacing : 0) + 22 + SCORE_END_SPACE;
    const width = Math.max(minimumWidth, viewportWidth * height / renderedHeight);
    svg.setAttribute('viewBox', `0 ${STAFF_TOP} ${width} ${height}`);
    const clip = this.find('[data-score-clip]');
    clip.setAttribute('x', scoreInset);
    clip.setAttribute('width', width - scoreInset);
    clip.setAttribute('height', height + 160);
    const staffLines = `<path d="${[80, 104, 128, 152, 176].map(y => `M0 ${y}H${width}`).join(' ')} M0 80V176 M${width} 80V176"/><path data-clef-divider d="M${CLEF_DIVIDER_X} 80V176"/>`;
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
    this.find('[data-note]').innerHTML = this.exerciseMarkup(this.current, layout?.positions.at(-1).x || currentX, true);
    const ghost = this.find('[data-ghost-note]');
    ghost.setAttribute('transform', `translate(0 ${rowOffset(clef)})`);
    ghost.setAttribute('data-clef', clef);
    ghost.innerHTML = ghostExercise
      ? this.exerciseMarkup(ghostExercise, layout?.previews[0].x || currentX + ghostSpacing)
      : '';
    const preview = this.find('[data-next-note]');
    preview.removeAttribute('transform');
    preview.removeAttribute('data-clef');
    preview.innerHTML = layout ? layout.previews.filter(position => position.note !== ghostExercise).map(position => `<g data-preview-note data-clef="${position.note.clef}" transform="translate(0 ${rowOffset(position.note.clef)})">${this.exerciseMarkup(position.note, position.x)}</g>`).join('') : '';
    const describeExercise = exercise => {
      const positions = exercise.notes.map(({ step, accidental }) => `${accidental === 1 ? 'sharp' : accidental === -1 ? 'flat' : 'natural'} note on ${describePosition(step)}`).join('; ');
      return `${exercise.clef === 'treble' ? 'Treble' : 'Bass'} clef: ${exercise.notes.length > 1 ? 'chord, ' : ''}${positions}.`;
    };
    const description = describeExercise(this.current);
    const ghostDescription = ghostExercise ? ` Last incorrect key: ${describeExercise(ghostExercise)}` : '';
    const nextNote = showHistory && this.previewQueue.length ? ` Upcoming: ${this.previewQueue.map(describeExercise).join(' ')}` : '';
    const pastNotes = showHistory && this.history.length
      ? ` Previous notes: ${this.history.map(note => `${note.clef} ${note.name}`).join(', ')}.` : '';
    const keyDescription = this.keyPractice.value === 'off' ? '' : ` Key signature: ${KEY_SIGNATURES[this.keyIndex].name}.`;
    svg.setAttribute('aria-label', description + keyDescription + (dual ? ' Treble staff above bass staff.' : '') + ghostDescription + pastNotes + nextNote);
    this.scrollHistory(layout, width, viewportWidth, currentX);
  }

  scrollHistory(layout, width, viewportWidth, currentX) {
    this.scoreScroll.hidden = !layout;
    if (!layout) {
      this.scoreState = null;
      this.scoreTrack.classList.remove('is-animating');
      this.scoreTrack.style.transform = 'translateX(0px)';
      this.scoreScroll.scrollLeft = 0;
      return;
    }
    const scale = viewportWidth / width;
    const leading = currentX - layout.positions[0].x;
    const key = `${this.mode}:${width.toFixed(2)}:${scale.toFixed(5)}:${layout.spacing}:${currentX}`;
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
    if (this.practicePanel || this.settingsTransition) return;
    if (this.phase !== 'question' || !Number.isInteger(ANSWER_PITCHES[value])) return;
    const pitch = ANSWER_PITCHES[value];
    if (this.matchedPitches.has(pitch)) return;
    const hadAnswerFocus = this.answers.includes(document.activeElement);
    const isCorrect = this.current.notes.some(note => isCorrectAnswer(note, value));
    this.ghostNote = !isCorrect && this.showGhosts.checked
      ? ghostNoteForAnswer(this.current.notes, value, this.mode, this.keyPractice.value === 'off' ? null : KEY_SIGNATURES[this.keyIndex].count)
      : null;
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
    this.challengeResult.hidden = false;
    this.find('[data-challenge-again]').focus({ preventScroll: true });
  }

  next(focus = false) {
    if (this.practicePanel) return;
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
