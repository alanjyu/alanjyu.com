import '../css/main.scss';

import Burger from './components/burger';
import TypeWriter from './components/type-writer';
import ThemeToggler from './components/theme-switch';
import Tracker from './components/tracker';
import Boundary from './components/bounds';
import Cursor from './components/cursor';
import Header from './components/header';

const components = [{
		class: TypeWriter,
		selector: '.js-type-writer'
	},
	{
		class: Burger,
		selector: '.js-burger'
	},
	{
		class: ThemeToggler,
		selector: '.js-theme-switch'
	},
	{
		class: Boundary,
		selector: '[data-src]'
	},
	{
		class: Cursor,
		selector: '[data-hover-target]'
	},
	{
		class: Header,
		selector: '.js-header'
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

	new Tracker();
});

