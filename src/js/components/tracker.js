export default class Tracker {
  constructor() {
    const root = document.documentElement;

    var mouseX = 0;
    var mouseY = 0;
    
    var offsetX = 0;
    var offsetY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      root.style.setProperty('--mouse-x', mouseX +'px');
      root.style.setProperty('--mouse-y', mouseY +'px');
    });

    document.addEventListener('scroll', () => {
      offsetX = window.pageXOffset;
      offsetY = window.pageYOffset;

      root.style.setProperty('--offset-x', offsetX);
      root.style.setProperty('--offset-y', offsetY);
    });
  }

  getMousePos() {
    return [mouseX, mouseY];
  }

  getOffset() {
    return [offsetX, offsetY];
  }
}