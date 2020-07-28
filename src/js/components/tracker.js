export default class Tracker {
  constructor(element) {
    const root = document.documentElement;

    this.mouseX = 0;
    this.mouseY = 0;

    this.pageX = 0;
    this.pageY = 0;

    this.offsetX = window.pageXOffset;
    this.offsetY = window.pageYOffset;

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      root.style.setProperty('--mouse-x', this.mouseX + 'px');
      // root.style.setProperty('--mouse-y', this.mouseY + 'px');

      this.pageX = e.pageX;
      this.pageY = e.pageY;

      // root.style.setProperty('--page-x', this.pageX + 'px');
      root.style.setProperty('--page-y', this.pageY + 'px');

      /** for the damn burger
      (using two translate property together is very laggy apparently) */ 

      root.style.setProperty('--burger-y', this.pageY-document.querySelector('.js-burger').offsetHeight*.5 + 'px');
    });

    document.addEventListener('scroll', () => {
      this.offsetX = window.pageXOffset;
      this.offsetY = window.pageYOffset;

      root.style.setProperty('--offset-x', this.offsetX);
      root.style.setProperty('--offset-y', this.offsetY);

      this.pageX = this.offsetX + this.mouseX || this.offsetX;
      this.pageY = this.offsetY + this.mouseY || this.offsetY;

      root.style.setProperty('--page-x', this.pageX + 'px');
      root.style.setProperty('--page-y', this.pageY + 'px');
      root.style.setProperty('--burger-y', this.pageY-document.querySelector('.js-burger').offsetHeight*.5 + 'px');
    })
    
    window.addEventListener('resize', () => {
      this.offsetX = window.pageXOffset;
      this.offsetY = window.pageYOffset;

      root.style.setProperty('--offset-x', this.offsetX);
      root.style.setProperty('--offset-y', this.offsetY);

      this.pageX = this.offsetX + this.mouseX || this.offsetX;
      this.pageY = this.offsetY + this.mouseY || this.offsetY;

      root.style.setProperty('--page-x', this.pageX + 'px');
      root.style.setProperty('--page-y', this.pageY + 'px');
      root.style.setProperty('--burger-y', this.pageY-document.querySelector('.js-burger').offsetHeight*.5 + 'px');
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
}