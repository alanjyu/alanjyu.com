export default class Hover {
  constructor() {
    this.hoverFill = document.querySelectorAll('.hover-fill, .hover-link, .tooltip');
    this.hoverGlow = document.querySelectorAll('.hover-glow');
    this.ctaLinks = document.querySelectorAll('.current-research__card-link--cta');

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

    this.ctaLinks.forEach(cta => {
      const gradientClasses = ['is-grad-1', 'is-grad-2', 'is-grad-3', 'is-grad-4'];

      if (!gradientClasses.some(cls => cta.classList.contains(cls))) {
        cta.classList.add('is-grad-1');
      }

      const cycleGradient = () => {
        let currentIndex = 0;
        gradientClasses.forEach((cls, index) => {
          if (cta.classList.contains(cls)) {
            currentIndex = index;
          }
        });

        const nextIndex = (currentIndex + 1) % gradientClasses.length;
        gradientClasses.forEach(cls => cta.classList.remove(cls));
        cta.classList.add(gradientClasses[nextIndex]);
      };

      cta.addEventListener('mouseleave', cycleGradient);
      cta.addEventListener('blur', cycleGradient);
    });
  }
}