// import Cursor from './components/cursor';
import Theme from './_theme.js';
import Nav from './_nav.js';
import Hover from './_hover.js';
import Gallery from './_gallery.js';
import Synth from './_synth.js';
import Tooltip from './_tooltip.js';
import Sticky from './_sticky.js';
import Parallax from './_parallax.js';
import FluidBackground from './_fluid.js';


const components = [
	{
		class: Theme,
		selector: '#theme-toggle'
	},
	{
		class: Nav,
		selector: 'nav'
	},
	{
		class: Hover,
		selector: 'html'
	},
	{
		class: Gallery,
		selector: '.gallery'
	},
	{
		class: Synth,
		selector: '.synth'
	},
	{
		class: Tooltip,
		selector: '.tooltip'
	},
  {
    class: Sticky,
    selector: '.sticky'
	},
	{
		class: Parallax,
		selector: '.parallax'
	},
	{
		class: FluidBackground,
		selector: '.dynamic-background'
  }
];

document.addEventListener('DOMContentLoaded', () => {
	// Checks if the selector is loaded.
	// If so, then excecute the corresponding scripts and options
	components.forEach(component => {
		if (document.querySelector(component.selector) !== null) {
			document.querySelectorAll(component.selector).forEach(
				element => new component.class(element, component.options)
			);
		}
	});
});