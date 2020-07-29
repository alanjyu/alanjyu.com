export default class Tracker {
  constructor(element) {
    const root = document.documentElement;

    this.mouseX = 0;
    this.mouseY = 0;

    root.style.setProperty('--mouse-x', this.mouseX);
    root.style.setProperty('--mouse-y', this.mouseY);

    this.pageX = 0;
    this.pageY = 0;

    root.style.setProperty('--page-x', this.pageX);
    root.style.setProperty('--page-y', this.pageY);

    this.offsetX = window.pageXOffset;
    this.offsetY = window.pageYOffset;

    root.style.setProperty('--offset-x', this.offsetX);
    root.style.setProperty('--offset-y', this.offsetY);

    this.viewPortWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    this.viewPortHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    root.style.setProperty('--viewport-x', this.viewPortWidth);
    root.style.setProperty('--viewport-y', this.viewPortHeight);

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      root.style.setProperty('--mouse-x', this.mouseX);
      root.style.setProperty('--mouse-y', this.mouseY);

      this.pageX = e.pageX;
      this.pageY = e.pageY;

      root.style.setProperty('--page-x', this.pageX);
      root.style.setProperty('--page-y', this.pageY);

      /** for the damn burger
      (using two translate property together is very laggy apparently) */ 

      root.style.setProperty('--burger-y', this.pageY-document.querySelector('.js-burger').offsetHeight*.5);
    });

    document.addEventListener('scroll', () => {
      this.offsetX = window.pageXOffset;
      this.offsetY = window.pageYOffset;

      root.style.setProperty('--offset-x', this.offsetX);
      root.style.setProperty('--offset-y', this.offsetY);

      this.pageX = this.offsetX + this.mouseX || this.offsetX;
      this.pageY = this.offsetY + this.mouseY || this.offsetY;

      root.style.setProperty('--page-x', this.pageX);
      root.style.setProperty('--page-y', this.pageY);
      root.style.setProperty('--burger-y', this.pageY-document.querySelector('.js-burger').offsetHeight*.5);
    })
    
    window.addEventListener('resize', () => {
      this.offsetX = window.pageXOffset;
      this.offsetY = window.pageYOffset;

      root.style.setProperty('--offset-x', this.offsetX);
      root.style.setProperty('--offset-y', this.offsetY);

      this.pageX = this.offsetX + this.mouseX;
      this.pageY = this.offsetY + this.mouseY;

      root.style.setProperty('--page-x', this.pageX + 'px');
      root.style.setProperty('--page-y', this.pageY + 'px');
      root.style.setProperty('--burger-y', this.pageY-document.querySelector('.js-burger').offsetHeight*.5 + 'px');

      this.viewPortWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      this.viewPortHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

      root.style.setProperty('--viewport-x', this.viewPortWidth);
      root.style.setProperty('--viewport-y', this.viewPortHeight);
    });
  }

  get mousePos() {
    return [this.mouseX, this.mouseY];
  }

  get pagePos() {
    return [this.pageX, this.pageY];
  }

  get offsetPos() {
    return [this.offsetX, this.offsetY];
  }

  get viewPortDim() {
    return [this.viewPortWidth, this.viewPortHeight];
  }
}