import {
  gsap
} from 'gsap';

export default class Header {
  constructor(element) {
    var prevScrollY = document.documentElement.scrollTop || window.pageYOffset;

    const toHideMenu = gsap.timeline();
    toHideMenu
      .to(
        '.js-header', {
          transform: 'translateY(-110%)'
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