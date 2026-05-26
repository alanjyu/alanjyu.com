export default class Sticky {
  constructor() {
    this.stickyElements = document.querySelectorAll('.sticky');

    document.addEventListener('scroll', () => {
      this.stickyElements.forEach(element => {
        if (element.getBoundingClientRect().top < 0) {
          element.classList.add('sticky--is-stuck');
        } else {
          element.classList.remove('sticky--is-stuck');
        }
      });
    });
  }
}