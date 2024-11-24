export default class Hover {
    constructor() {
        this.buttons = document.querySelectorAll('.hover-fill');

        this.buttons.forEach(button => {
          button.addEventListener('mouseenter', function(e) {
            const parentOffset = button.getBoundingClientRect();
            const relX = e.pageX - window.scrollX - parentOffset.left;
            const relY = e.pageY - window.scrollY - parentOffset.top;
      
            // Set CSS variables for `::after` positioning
            button.style.setProperty('--hover-x', `${relX}px`);
            button.style.setProperty('--hover-y', `${relY}px`);
          });
      
          button.addEventListener('mouseout', function(e) {
            const parentOffset = button.getBoundingClientRect();
            const relX = e.pageX - window.scrollX - parentOffset.left;
            const relY = e.pageY - window.scrollY - parentOffset.top;
      
            // Update `--hover-x` and `--hover-y` variables on mouse exit
            button.style.setProperty('--hover-x', `${relX}px`);
            button.style.setProperty('--hover-y', `${relY}px`);
          });
        });
    }
}