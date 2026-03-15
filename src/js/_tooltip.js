export default class Tooltip {
  constructor() {
    const tooltipTerms = document.querySelectorAll('.tooltip');

    tooltipTerms.forEach(term => {
      const tooltipText = term.getAttribute('data-tooltip');
      if (!tooltipText) return;

      const tooltipBox = document.createElement('div');
      tooltipBox.className = 'tooltip-box';
      tooltipBox.textContent = tooltipText;
      document.body.appendChild(tooltipBox);

      const updatePosition = () => {
        const rect = term.getBoundingClientRect();
        tooltipBox.style.left = `${rect.left + rect.width / 2}px`;
        tooltipBox.style.top = `${rect.top}px`;
      };

      term.addEventListener('mouseenter', () => {
        updatePosition();
        tooltipBox.classList.add('tooltip-box--visible');
      });

      term.addEventListener('mouseleave', () => {
        tooltipBox.classList.remove('tooltip-box--visible');
      });

      term.addEventListener('focus', () => {
        updatePosition();
        tooltipBox.classList.add('tooltip-box--visible');
      });

      term.addEventListener('blur', () => {
        tooltipBox.classList.remove('tooltip-box--visible');
      });

      window.addEventListener('scroll', updatePosition, { passive: true });
      window.addEventListener('resize', updatePosition);
    });
  }
}