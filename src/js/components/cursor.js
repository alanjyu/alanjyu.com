export default class Cursor {
  constructor(element) {
    this.targets = document.querySelectorAll('[data-hover-target]');
    this.cursor = document.querySelector('.js-cursor');
    this.duration = 1000;

    this.cursor.style.setProperty('--duration', this.duration);
    this.targets.forEach(target => {
      target.addEventListener('mouseenter', (e) => {
        let rect = target.getBoundingClientRect();
        this.cursor.dataset.hover = true;
        this.cursor.style.setProperty('--hover-x', rect.left);
        this.cursor.style.setProperty('--hover-y', rect.top);
        this.cursor.style.setProperty('--width', rect.width);
        this.cursor.style.setProperty('--height', rect.height);
      });

      target.addEventListener('mouseleave', (e) => {
        delete this.cursor.dataset.hover;
        this.cursor.style.removeProperty('--hover-x');
        this.cursor.style.removeProperty('--hover-y');
        this.cursor.style.removeProperty('--width');
        this.cursor.style.removeProperty('--height');
      });
    });
  }
}