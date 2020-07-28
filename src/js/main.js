import '../css/main.scss';
import 'typeface-dm-sans';
import 'typeface-dm-serif-display';

import ThemeToggler from './components/theme-switch';
import Burger from './components/burger';
import TypeWriter from './components/type-writer';
import Carousel from './components/carousel';
import Tracker from './components/tracker';
import Boundary from './components/bounds';

const components = [{
		class: TypeWriter,
		selector: '.js-type-writer'
	},
	{
		class: Carousel,
		selector: '.js-carousel'
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
		class: Tracker,
		selector: '.js-tracker'
	},
	{
		class: Boundary,
		selector: '[data-src]'
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