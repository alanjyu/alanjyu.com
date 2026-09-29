export default class Sticky {
  constructor() {
    this.stickyElements = document.querySelectorAll('.sticky');
    this.frame = null;
    this.update = this.update.bind(this);
    this.onScroll = this.onScroll.bind(this);
    document.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
    this.update();
  }

  onScroll() {
    if (this.frame === null) this.frame = requestAnimationFrame(this.update);
  }

  update() {
    this.frame = null;
    // Read all positions before changing styles to avoid interleaving layout reads and writes.
    const stuck = Array.from(this.stickyElements, element => element.getBoundingClientRect().top < 0);
    this.stickyElements.forEach((element, index) => {
      element.classList.toggle('sticky--is-stuck', stuck[index]);
    });
  }

  destroy() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    document.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
  }
}
