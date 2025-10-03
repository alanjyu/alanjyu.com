export default class Tooltip {
  constructor() {
    const tooltipTerms = document.querySelectorAll('.tooltip');
			
    tooltipTerms.forEach(term => {
      const tooltipText = term.getAttribute('data-tooltip');
      if (tooltipText) {
        const tooltipBox = document.createElement('div');
        tooltipBox.className = 'tooltip-box';
        tooltipBox.textContent = tooltipText;
        term.appendChild(tooltipBox);
      }
    });
  }
}