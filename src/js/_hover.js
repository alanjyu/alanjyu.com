export default class Hover {
  constructor() {
    this.hoverFill = document.querySelectorAll('.hover-fill');
    this.hoverGlow = document.querySelectorAll('.hover-glow');

    this.hoverFill.forEach(filler => {
      filler.addEventListener('mouseenter', function(e) {
        let parentOffset = filler.getBoundingClientRect();
        let relX = e.pageX - window.scrollX - parentOffset.left;
        let relY = e.pageY - window.scrollY - parentOffset.top;
  
        // Set CSS variables for positioning
        filler.style.setProperty('--hover-x', `${relX}px`);
        filler.style.setProperty('--hover-y', `${relY}px`);
      });
  
      filler.addEventListener('mouseout', function(e) {
        let parentOffset = filler.getBoundingClientRect();
        let relX = e.pageX - window.scrollX - parentOffset.left;
        let relY = e.pageY - window.scrollY - parentOffset.top;
  
        // Update `--hover-x` and `--hover-y` variables on mouse exit
        filler.style.setProperty('--hover-x', `${relX}px`);
        filler.style.setProperty('--hover-y', `${relY}px`);
      });
    });

    this.hoverGlow.forEach(glower => {
      glower.addEventListener('mousemove', function(e) {
        let parentOffset = glower.getBoundingClientRect();
        let relX = e.pageX - window.scrollX - parentOffset.left;
        let relY = e.pageY - window.scrollY - parentOffset.top;
  
        // Set CSS variables for positioning
        glower.style.setProperty('--hover-x', `${relX}px`);
        glower.style.setProperty('--hover-y', `${relY}px`);
      });
  
      glower.addEventListener('mouseout', function(e) {
        let parentOffset = glower.getBoundingClientRect();
        let relX = e.pageX - window.scrollX - parentOffset.left;
        let relY = e.pageY - window.scrollY - parentOffset.top;
  
        // Update `--hover-x` and `--hover-y` variables on mouse exit
        glower.style.setProperty('--hover-x', `${relX}px`);
        glower.style.setProperty('--hover-y', `${relY}px`);
      });
    });
  }
}