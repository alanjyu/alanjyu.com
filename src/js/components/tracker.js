export default class Tracker {
  constructor(element) {
    const root = document.documentElement;

    this.scrollX = window.pageXOffset;
    this.scrollY = window.pageYOffset || document.documentElement.scrollTop;
    root.style.setProperty('--scroll-x', this.scrollX);
    root.style.setProperty('--scroll-y', this.scrollY);

    this.viewPortWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    this.viewPortHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    root.style.setProperty('--window-w', this.viewPortWidth);
    root.style.setProperty('--window-h', this.viewPortHeight);

    this.documnetWidth = Math.max(document.body.clientWidth || 0, document.documentElement.clientWidth || 0, document.documentElement.scrollWidth || 0);
    this.documnetHeight = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight || 0, document.documentElement.scrollHeight || 0);
    root.style.setProperty('--document-w', this.documnetWidth);
    root.style.setProperty('--document-h', this.documnetHeight);

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      root.style.setProperty('--mouse-x', this.mouseX);
      root.style.setProperty('--mouse-y', this.mouseY);
    });

    document.addEventListener('scroll', () => {
      this.scrollX = window.pageXOffset;
      this.scrollY = window.pageYOffset;
      root.style.setProperty('--scroll-x', this.scrollX);
      root.style.setProperty('--scroll-y', this.scrollY);
    })

    window.addEventListener('resize', () => {
      this.scrollX = window.pageXOffset;
      this.scrollY = window.pageYOffset;
      root.style.setProperty('--scroll-x', this.scrollX);
      root.style.setProperty('--scroll-y', this.scrollY);

      this.viewPortWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      this.viewPortHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      root.style.setProperty('--window-w', this.viewPortWidth);
      root.style.setProperty('--window-h', this.viewPortHeight);

      this.documnetWidth = Math.max(document.body.clientWidth || 0, document.documentElement.clientWidth || 0, document.documentElement.scrollWidth || 0);
      this.documnetHeight = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight || 0, document.documentElement.scrollHeight || 0);
      root.style.setProperty('--document-w', this.documnetWidth);
      root.style.setProperty('--document-h', this.documnetHeight);
    });
  }

  get mousePos() {
    return [this.mouseX, this.mouseY];
  }

  get offsetPos() {
    return [this.scrollX, this.scrollY];
  }

  get viewPortDim() {
    return [this.viewPortWidth, this.viewPortHeight];
  }
}