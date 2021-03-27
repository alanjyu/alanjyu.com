import { gsap } from 'gsap';

export default class Cursor {
  constructor() {
    const targets = document.querySelectorAll('a, [data-hover-target]');
    const cursor = document.querySelector('.cursor');
    var isHovering = false;
    var rect = 0;

    var cx = 0;
    var cy = 0;
    var wobble = 10;

    var cursorSize = window.innerWidth * .5;
    cursor.style.width = cursorSize;
    cursor.style.height = cursorSize;
    
    window.addEventListener('resize', (e) => {
      cx = e.clientX - cursor.offsetWidth  * .5;
      cy = e.clientY - cursor.offsetHeight * .5;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';

      size = window.innerWidth * .5;
      cursor.style.width = size;
      cursor.style.height = size;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isHovering) {
        let cx = e.clientX - cursor.offsetWidth  * .5;
        let cy = e.clientY - cursor.offsetHeight * .5;
        cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      } else {
        let hx = (rect.left + rect.right) * .5; // hover center x
        let hy = (rect.top + rect.bottom) * .5; // hover center y
        // let ax = ; // adjustment based on relation of hx and cx
      }
    });

    targets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        rect = target.getBoundingClientRect();
        isHovering = true;

        /* finds the center point of the objects */
        cursor.style.setProperty('--hover-x', (rect.left + rect.right) * .5);
        cursor.style.setProperty('--hover-y', (rect.top + rect.bottom) * .5);
        cursor.style.setProperty('--hover-width', rect.width);
        cursor.style.setProperty('--hover-height', rect.height);
      });

      target.addEventListener('mouseleave', () => {
        isHovering = false;
        cursor.style.removeProperty('--hover-x');
        cursor.style.removeProperty('--hover-y');
        cursor.style.removeProperty('--hover-width');
        cursor.style.removeProperty('--hover-height');
      });
    });

    var toHideMouse = gsap.timeline();
    toHideMouse.fromTo(
      '.cursor', {
        opacity: 1
      },
      {
        opacity: 0
      },
      0
    );
    
    toHideMouse.pause();

    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        toHideMouse.play();
      }
    });

    document.addEventListener('mouseenter', () => {
        toHideMouse.reverse();
    });
  }
}