export default class ControlHints {
  constructor(root) {
    this.root = root;
    this.hovered = null;
    this.focused = null;
    this.dismissed = false;
    this.timer = null;
    this.hint = document.createElement('div');
    this.hint.className = 'clef-control-hint';
    this.hint.setAttribute('aria-hidden', 'true');
    this.hint.hidden = true;
    document.body.append(this.hint);

    root.addEventListener('pointerover', event => {
      if (event.pointerType === 'touch') return;
      const target = this.target(event.target);
      if (target === this.hovered) return;
      this.hovered = target;
      this.dismissed = false;
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.refresh(), 250);
    });
    root.addEventListener('pointerout', event => {
      const target = this.target(event.target);
      if (target?.contains(event.relatedTarget)) return;
      window.clearTimeout(this.timer);
      this.hovered = null;
      this.refresh();
    });
    root.addEventListener('focusin', event => {
      window.clearTimeout(this.timer);
      this.hovered = null;
      this.focused = this.target(event.target);
      this.dismissed = false;
      this.refresh();
    });
    root.addEventListener('focusout', event => {
      this.focused = this.target(event.relatedTarget);
      this.refresh();
    });
    root.addEventListener('change', () => this.refresh());
    window.addEventListener('scroll', () => this.refresh(), { passive: true, capture: true });
    window.addEventListener('resize', () => this.refresh());
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      this.dismissed = true;
      this.hide();
    });
  }

  target(element) {
    const target = element?.closest?.('[data-control-hint]');
    return target && this.root.contains(target) ? target : null;
  }

  refresh() {
    const target = this.hovered || this.focused;
    if (!target || this.dismissed) return this.hide();
    const control = target.matches('button') ? target : target.querySelector('input, select');
    let label = control.getAttribute('aria-label');
    if (control.matches('select')) label += `: ${control.selectedOptions[0].textContent}`;
    this.active = target;
    this.hint.textContent = label;
    this.hint.hidden = false;
    this.position();
  }

  position() {
    if (!this.active || this.hint.hidden) return;
    const rect = this.active.getBoundingClientRect();
    const row = this.root.getBoundingClientRect();
    if (rect.right <= row.left || rect.left >= row.right || rect.bottom <= 0 || rect.top >= window.innerHeight) return this.hide();
    const size = this.hint.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - size.width - 8, rect.left + (rect.width - size.width) / 2));
    const above = rect.top - size.height - 8;
    const top = above >= 8 ? above : Math.min(window.innerHeight - size.height - 8, rect.bottom + 8);
    this.hint.style.left = `${left}px`;
    this.hint.style.top = `${top}px`;
  }

  hide() {
    window.clearTimeout(this.timer);
    this.hint.hidden = true;
    this.active = null;
  }
}
