export default class Cursor {
  constructor() {
    const coverTargets = document.querySelectorAll('[data-target-cover]');
    const dotTargets = document.querySelectorAll('[data-target-dot]');
    const iframes = document.querySelectorAll('iframe');
    const cursor = document.querySelector('.cursor');

    var coverTargetHover = false;
    var dotTargetHover = false;
    var cx = document.documentElement.clientWidth * .5;
    var cy = document.documentElement.clientHeight * .5; // dyanmic cursor position
    var hx = 0, hy = 0;
    var ax = 0, ay = 0; // adjustments for cursor position
    var bw = 30, bh = 30; // base width and height
    var cw = bw, ch = bw; // dyanmic cursor width and height
    const wobble = 10;

    cursor.style.opacity = '0';

    document.addEventListener('mousemove', (e) => {
      // update cursor width and height
      cursor.style.width = cw + 'px';
      cursor.style.height = ch + 'px';
      cursor.style.opacity = '1';

      // cover
      if (coverTargetHover && (!dotTargetHover)) {
        cx = hx + ax - cw * .5;
        cy = hy + ay - ch * .5;
        cursor.style.backgroundColor = '#fff';
        cursor.style.borderRadius = '10px';
      } else if (dotTargetHover && (!coverTargetHover)) {
        cx = hx + ax;
        cy = hy + ay;
        cursor.style.backgroundColor = '#fff';
      } else {
        cx = e.clientX - cw * .5;
        cy = e.clientY - ch * .5;
        cursor.style.backgroundColor = 'transparent';
        cursor.style.borderRadius = '50%';
      }
      
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });

    // covers the entire target
    coverTargets.forEach(coverTarget => {
      coverTarget.addEventListener('mousemove', (e) => {
        coverTargetHover = true;
        let rect = coverTarget.getBoundingClientRect();
        cw = rect.width + 15;
        ch = rect.height + 15;
        hx = (rect.left + rect.right) * .5; // hover center x
        hy = (rect.top + rect.bottom) * .5; // hover center y
        ax = (e.clientX - hx) / cw * wobble; // adjustment on width
        ay = (e.clientY - hy) / ch * wobble; // adjustment on height
      });

      coverTarget.addEventListener('mouseleave', (e) => {
        coverTargetHover = false;
        cw = bw;
        ch = bh;
        hx = 0;
        hy = 0;
        ax = 0;
        ay = 0;
      });
    });

    // transform into a dot
    dotTargets.forEach(dotTarget => {
      dotTarget.addEventListener('mousemove', (e) => {
        dotTargetHover = true;
        let rect = dotTarget.getBoundingClientRect();
        hx = rect.right - 20;
        hy = rect.bottom - 20;
        cw = 5;
        ch = 5;
        ax = (e.clientX - (rect.left + rect.right) * .5) * wobble * .005;
        ay = (e.clientY - (rect.top + rect.bottom) * .5) * wobble * .005;
      });

      dotTarget.addEventListener('mouseleave', (e) => {
        dotTargetHover = false;
        cw = bw;
        ch = bh;
        hx = 0;
        hy = 0;
        ax = 0;
        ay = 0;
      });
    });

    iframes.forEach(iframe => {
      iframe.addEventListener('mousemove', (e) => {
        cursor.style.opacity = '0';
      });

      iframe.addEventListener('mouseleave', (e) => {
        cursor.style.opacity = '1';
      });
    });
  }
}