import '../css/style.scss';

import Burger from './components/burger';
import ThemeToggler from './components/theme';
import Cursor from './components/cursor';

const components = [
	{
		class: Burger,
		selector: '.burger'
	},
	{
		class: ThemeToggler,
		selector: '.themeswitch'
	},
	{
		class: Cursor,
		selector: '.cursor'
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

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-176120194-1');
