export default class Header {
  constructor(element) {
    this.header = document.querySelector('.js-header');
    this.header_is_fixed = false;
    this.header_is_hidden = false;

    var pageYOffset = window.pageYOffset;
    var landingHeight = document.querySelector('.hero').offsetHeight;

    if (pageYOffset > landingHeight) {
      this.header_is_fixed = true;
    } else {
      this.header_is_fixed = false;
    }

    if (this.header_is_fixed) {
      this.header.style.position = 'fixed';
    } else {
      this.header.style.position = 'absolute';
    }

    document.addEventListener('scroll', () => {
      pageYOffset = window.pageYOffset;
      landingHeight = document.querySelector('.hero').offsetHeight;
  
      if (pageYOffset > landingHeight) {
        this.header_is_fixed = true;
        this.header.style.position = 'fixed';
      } else {
        this.header_is_fixed = false;
        this.header.style.position = 'absolute';
      }
    });

    document.addEventListener('resize', () => {
      pageYOffset = window.pageYOffset;
      landingHeight = document.querySelector('.hero').offsetHeight;
  
      if (pageYOffset > viewPortHeight) {
        this.header_is_fixed = true;
        this.header.style.position = 'fixed';
      } else {
        this.header_is_fixed = false;
        this.header.style.position = 'absolute';
      }
    });
  }
} 