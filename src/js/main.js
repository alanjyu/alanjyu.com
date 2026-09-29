import Theme from './components/theme.js';
import Nav from './components/nav.js';
import Hover from './components/hover.js';
import Tooltip from './components/tooltip.js';
import Sticky from './components/sticky.js';
import Parallax from './components/parallax.js';


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
		load: () => import('./components/gallery.js'),
		selector: '.gallery',
		once: true
	},
	{
		load: () => import('./components/synth/synth.js'),
		selector: '.synth'
	},
	{
		class: Tooltip,
		selector: '.tooltip',
		once: true
	},
  {
    class: Sticky,
		selector: '.sticky',
		once: true
	},
	{
		class: Parallax,
		selector: '.parallax'
	},
	{
		load: () => import('./components/fluid/fluid.js'),
		selector: '.dynamic-background'
  }
];

document.addEventListener('DOMContentLoaded', () => {
	components.forEach(async component => {
		const elements = document.querySelectorAll(component.selector);
		if (!elements.length) return;

		try {
			const Component = component.class || (await component.load()).default;
			if (component.once) {
				new Component(elements[0], component.options);
			} else {
				elements.forEach(element => new Component(element, component.options));
			}
		} catch (error) {
			console.error(`Could not initialize ${component.selector}.`, error);
		}
	});
});
