// Use a scrolling document layer: iOS Safari clips fixed layers at its toolbars.
export default class FluidBackdrop {
	constructor(element) {
		this.element = element;
		this.offset = null;
		this.onScroll = this.onScroll.bind(this);
		this.onScroll();
		window.addEventListener('scroll', this.onScroll, { passive: true });
		window.addEventListener('pageshow', this.onScroll);
	}

	onScroll() {
		const offset = Math.max(0, window.scrollY);
		if (offset === this.offset) return;
		this.offset = offset;
		this.element.style.setProperty('--fluid-scroll-y', `${offset}px`);
	}

	destroy() {
		window.removeEventListener('scroll', this.onScroll);
		window.removeEventListener('pageshow', this.onScroll);
		this.element.style.removeProperty('--fluid-scroll-y');
	}
}
