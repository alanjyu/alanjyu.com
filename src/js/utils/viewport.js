export default class Viewport {
	constructor(element, onChange, options = {}) {
		this.onChange = onChange;
		this.observer = new IntersectionObserver(
			entries => this.onChange(entries[0].isIntersecting),
			{ rootMargin: options.rootMargin || '0px' }
		);

		this.observer.observe(element);
	}

	destroy() {
		this.observer.disconnect();
	}
}
