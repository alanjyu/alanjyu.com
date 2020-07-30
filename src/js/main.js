import '../css/main.scss';
import 'typeface-dm-sans';
import 'typeface-dm-serif-display';
import RETICOOL from 'reticool';

import Burger from './components/burger';
import TypeWriter from './components/type-writer';
import Carousel from './components/carousel';
import ThemeToggler from './components/theme-switch';
import Tracker from './components/tracker';
import Boundary from './components/bounds';
import Cursor from './components/cursor';

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
	},
	{
		class: Cursor,
		selector: '[data-hover-target]'
	}
];

document.addEventListener('DOMContentLoaded', () => {

	/* Checks if the selector is loaded.
	If so, then excecute the corresponding scripts and options */

	// const config = {
	// 	/** Replace document cursor. Not recommended to set to 'none' */
	// 	cursor: 'crosshair',
	
	// 	/** Size of your RETICOOL */
	// 	radius: 80,
	
	// 	/** Border width around your RETICOOL */
	// 	borderWidth: 3,
	
	// 	/** The default color of your RETICOOL */
	// 	color: '#49D292',
	
	// 	/** The default opacity of your RETICOOL */
	// 	opacity: 0.85,
	
	// 	/**
	// 	 * Easing of your RETICOOL.
	// 	 * The lower the number the slow the RETICOOL will move
	// 	 * Recommended to keep this below 0.6 to avoid visual glitches
	// 	 */
	// 	ease: 0.2,
	
	// 	/** Selectors to trigger RETICOOL locking automatically on specific elements */
	// 	lockTriggers: '[data-lock], a, button',
	
	// 	/** Your RETICOOL color when locked */
	// 	lockColor: '#E8F79A',
	
	// 	/** Your RETICOOL opacity when locked */
	// 	lockOpacity: 0.99,
	
	// 	/** A class added to your RETICOOL when locked */
	// 	lockClass: null,
	
	// 	/** Amount your RETICOOL will travel around the locked point */
	// 	lockTravel: 0.15,
	
	// 	/**
	// 	 * Expand your RETICOOL over the element it locks to.
	// 	 * Set to `false` to disable expansion,
	// 	 * Set to `0` to fit the element exactly
	// 	 * Set to any other number, including negative to expand by that many pixels around the element
	// 	 */
	// 	lockExpand: 20,
	
	// 	/** How fast your RETICOOL changes sizes */
	// 	lockEase: 0.3,
	
	// 	/**
	// 	 * What should appear inside your RETICOOL.
	// 	 * You can inject custom HTML for styling, an SVG or IMG, or set it to null for no center
	// 	 */
	// 	content: '+',
	
	// 	/** Use CSS Vars to power your RETICOOL, if supported */
	// 	useCSSVars: true,
	// };
	
	// new RETICOOL(config);

	components.forEach(component => {
		if (document.querySelector(component.selector) !== null) {
			document.querySelectorAll(component.selector).forEach(
				element => new component.class(element, component.options)
			);
		};
	});
});

