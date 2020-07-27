export default class Carousel {
  constructor(element) {
    this._carousel = document.querySelector('.carousel');
    this._canvases = document.querySelectorAll('.carousel__canvas');
    this._int = 0;

    this._canvases[this._int].dataset.active = true;
    this._carousel.dataset.int = this._int + 1;
    this._carousel.dataset.intCount = this._canvases.length;

    this._carousel.addEventListener('click', () => {
      this.switchCanvas();
    });
  }

  switchCanvas() {
    delete this._canvases[this._int].dataset.active;
    this._int = (this._int + 1) % this._canvases.length;
    this._carousel.dataset.int = this._int + 1;
    this._canvases[this._int].dataset.active = true;
  }
};