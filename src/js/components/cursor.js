export default class Cursor {
  constructor() {
    const targets = document.querySelectorAll('a, [data-hover-target]');
    const cursor = document.querySelector('.js-cursor');

    targets.forEach(target => {
      target.addEventListener('mouseenter', (e) => {
        let rect = target.getBoundingClientRect();
        cursor.dataset.hover = true;
        
        /* finds the center point of the objects */
        cursor.style.setProperty('--hover-x', (rect.left + rect.right) * .5);
        cursor.style.setProperty('--hover-y', (rect.top + rect.bottom) * .5);
        cursor.style.setProperty('--hover-width', rect.width);
        cursor.style.setProperty('--hover-height', rect.height);
      });

      target.addEventListener('mouseleave', (e) => {
        delete cursor.dataset.hover;
        cursor.style.removeProperty('--hover-x');
        cursor.style.removeProperty('--hover-y');
        cursor.style.removeProperty('--hover-width');
        cursor.style.removeProperty('--hover-height');
      });
    });
  }
}