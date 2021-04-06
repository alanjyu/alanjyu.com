import '../css/style.scss';

import Burger from './components/burger';
import TypeWriter from './components/type-writer';
import ThemeToggler from './components/theme';
import Boundary from './components/bounds';
import Cursor from './components/cursor';
import Scrollbar from './components/scrollbar';
import Header from './components/header';

const components = [{
		class: TypeWriter,
		selector: '.type-writer'
	},
	{
		class: Burger,
		selector: '.burger'
	},
	{
		class: ThemeToggler,
		selector: '.theme'
	},
	{
		class: Boundary,
		selector: 'img'
	},
	{
		class: Cursor,
		selector: '.cursor'
	},
	{
		class: Header,
		selector: '.header'
	},
	{
		class: Scrollbar,
		selector: '.scrollbar'
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
