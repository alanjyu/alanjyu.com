import {
  gsap
} from 'gsap';

export default class Header {
  constructor(e) {
    var prevScrollY = document.documentElement.scrollTop || window.pageYOffset;

    var toHideMenu = gsap.timeline();
    toHideMenu
      .to(
        '.header', {
          opacity: 0,
        }
      );

    toHideMenu.pause();

    window.addEventListener('scroll', () => {
      var scrollY = document.documentElement.scrollTop || window.pageYOffset;
      if (scrollY <= prevScrollY) {
        toHideMenu.reverse();
      } else {
        toHideMenu.play();
      }
      prevScrollY = scrollY;
    }, false);
  }
}