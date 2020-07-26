function switchCanvas() {
  const carousel = document.querySelector('.carousel');
  const canvases = document.querySelectorAll('.carousel__canvas');

  let int = 0;
  canvases[int].dataset.active = true;
  carousel.dataset.int = int + 1;
  carousel.dataset.intCount = canvases.length;

  carousel.addEventListener('click', () => {
    delete canvases[int].dataset.active;
    int = (int + 1) % canvases.length;
    carousel.dataset.int = int + 1;
    canvases[int].dataset.active = true;
  });
}

export {switchCanvas};
