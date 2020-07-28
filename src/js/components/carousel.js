export default class Carousel {
  constructor() {
    this.carousel = document.querySelector('.carousel');
    this.canvases = document.querySelectorAll('.carousel__canvas');
    this.int = 0;

    this.canvases[this.int].dataset.active = true;
    this.carousel.dataset.int = this.int + 1;
    this.carousel.dataset.intCount = this.canvases.length;

    this.carousel.addEventListener('click', () => {
      this.switchCanvas();
    });
  }

  switchCanvas() {
    delete this.canvases[this.int].dataset.active;
    this.int = (this.int + 1) % this.canvases.length;
    this.carousel.dataset.int = this.int + 1;
    this.canvases[this.int].dataset.active = true;
  }
};