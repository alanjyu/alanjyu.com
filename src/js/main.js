// import Cursor from './components/cursor';
import Theme from './components/theme';

const components = [
	{
		class: Cursor,
		selector: '.cursor'
	},
	{
		class: Theme,
		selector: 'html'
	}
];

document.addEventListener('DOMContentLoaded', () => {
	/* Checks if the selector is loaded.
	If so, then excecute the corresponding scripts and options */

	components.forEach(component => {
		if (document.querySelector(component.selector) !== null) {
			document.querySelectorAll(component.selector).forEach(
				element => new component.class(element, component.options)
			);
		};
	});	
});