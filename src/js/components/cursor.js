export default class Cursor {
  constructor() {
    const targets = document.querySelectorAll('[data-target]');
    const iframes = document.querySelectorAll('iframe');
    const cursor = document.querySelector('.cursor');

    var targetHover = false;
    var rect = 0;
    var cx = 0, cy = 0;
    var hx = 0, hy = 0;
    var ax = 0, ay = 0;
    var bw = 30, bh = 30; // base width and height
    var cw = bw, ch = bw;
    const wobble = 20;

    document.addEventListener('mousemove', (e) => {
      // update mouse position
      cursor.style.width = cw + 'px';
      cursor.style.height = ch + 'px';

      if (targetHover) {
        cx = hx + ax - cw * .5;
        cy = hy + ay - ch * .5;
        cursor.style.backgroundColor = '#fff';
      } else {
        cx = e.clientX - cw * .5;
        cy = e.clientY - ch * .5;
        cursor.style.backgroundColor = 'transparent';
      }
      
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    });

    targets.forEach(target => {
      target.addEventListener('mousemove', (e) => {
        targetHover = true;
        rect = target.getBoundingClientRect();
        cw = rect.width + 20;
        ch = rect.height + 20;
        hx = (rect.left + rect.right) * .5; // hover center x
        hy = (rect.top + rect.bottom) * .5; // hover center y
        ax = (e.clientX - hx) / cw * wobble; // adjustment on width
        ay = (e.clientY - hy) / ch * wobble; // adjustment on height
      });

      target.addEventListener('mouseleave', (e) => {
        targetHover = false;
        rect = 0;
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