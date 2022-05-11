import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';

export default class Slider {
  constructor() {
    var swiper = new Swiper(".note", {
      mousewheel: true,
      keyboard: {
        enabled: true,
        onlyInViewport: false
      }
      // pagination: {
      //   el: ".swiper-pagination",
      //   clickable: true,
      // },
    });
  }
}
