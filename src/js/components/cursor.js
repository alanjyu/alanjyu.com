import { gsap } from 'gsap';

export default class Cursor {
  constructor() {
    const targets = document.querySelectorAll('[data-target]');
    const cursor = document.querySelector('.cursor');

    var isHovering = false;
    var rect = 0;
    var cx, cy, cw, ch, hx, hy, ax, ay;
    var cw = 24;
    var ch = 24;
    const wobble = 20;

    cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';

    document.addEventListener('mousemove', (e) => {
      // update mouse position
      cx = e.clientX - cursor.offsetWidth * .5;
      cy = e.clientY - cursor.offsetHeight * .5;
      cursor.style.width = cw + 'px';
      cursor.style.height = ch + 'px';

      if (isHovering) {
        // update mouse position based on hovered box position
        ax = (e.clientX - hx) / cursor.offsetWidth * wobble; // adjustment on width
        ay = (e.clientY - hy) / cursor.offsetHeight * wobble; // adjustment on height
        cx = hx + ax - cursor.offsetWidth * .5;
        cy = hy + ay - cursor.offsetHeight * .5;
      }

      targets.forEach(target => {
        target.addEventListener('mouseenter', () => {
          isHovering = true;
          rect = target.getBoundingClientRect();
          hx = (rect.left + rect.right) * .5; // hover center x
          hy = (rect.top + rect.bottom) * .5; // hover center y
          cw = rect.width + 25;
          ch = rect.height + 25;
          cursor.style.width = cw + 'px';
          cursor.style.height = ch + 'px';
        });
  
        target.addEventListener('mouseleave', (e) => {
          isHovering = false;
          rect = 0;
          cw = 24;
          ch = 24;
          cursor.style.width = cw + 'px';
          cursor.style.height = ch + 'px';
  
          cx = e.clientX - cursor.style.width * .5;
          cy = e.clientY - cursor.style.height * .5;
        });
      });

      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    });

    var toHideMouse = gsap.timeline();
    toHideMouse.fromTo(
      '.cursor', {
        opacity: .85
      },
      {
        opacity: 0,
        duration: .15
      },
      0
    );
    toHideMouse.pause();

    document.addEventListener('mouseleave', (e) => {
      if (e.clientY == 0 || e.clientX == 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        toHideMouse.play();
      }
    });

    document.addEventListener('mouseenter', () => {
      toHideMouse.reverse();
    });
  }
}