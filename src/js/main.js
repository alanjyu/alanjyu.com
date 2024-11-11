// import Cursor from './components/cursor';
import Theme from './_theme.js';
import Nav from './_nav.js';
import Hover from './_hover.js';

const components = [
	{
		class: Theme,
		selector: 'html'
	},
	{
		class: Nav,
		selector: 'nav'
	},
	{
		class: Hover,
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