import { gsap } from 'gsap';

export default class Header {
  constructor(element) {
    var isHidden= false;
    var scrollY = document.documentElement.style.getPropertyValue('--scroll-y');

    const toHideMenu = gsap.timeline();
    toHideMenu
      .to(
        '.js-header', {
          transform: 'translateY(-100%)'
        }
      );
    
    toHideMenu.pause();
    
  }
} 