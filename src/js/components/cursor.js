export default class Cursor {
  constructor() {
    this.targets = document.querySelectorAll('[data-hover-target]');
    this.cursor = document.querySelector('.js-cursor');

    this.targets.forEach(target => {
      target.addEventListener('mouseenter', (e) => {
        let rect = target.getBoundingClientRect();
        this.cursor.dataset.hover = true;
        
        /* finds the center point of the objects */
        this.cursor.style.setProperty('--hover-x', (rect.left + rect.right) * .5);
        this.cursor.style.setProperty('--hover-y', (rect.top + rect.bottom) * .5);
        this.cursor.style.setProperty('--hover-width', rect.width * 2);
        this.cursor.style.setProperty('--hover-height', rect.height * 2);
      });

      target.addEventListener('mouseleave', (e) => {
        delete this.cursor.dataset.hover;
        this.cursor.style.removeProperty('--hover-x');
        this.cursor.style.removeProperty('--hover-y');
        this.cursor.style.removeProperty('--hover-width');
        this.cursor.style.removeProperty('--hover-height');
      });
    });
  }
}