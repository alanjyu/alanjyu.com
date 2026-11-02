const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export default class Parallax {
	constructor(element) {
		this.element = element;
		this.speed = Number(element.dataset.parallaxSpeed || 0.12);
		this.blur = Math.max(0, Number(element.dataset.parallaxBlur) || 0);
		this.hasFixedAncestor = this.findFixedAncestor();
		this.frame = null;
		this.nearViewport = true;
		this.values = new Map();
		this.onScroll = this.onScroll.bind(this);
		this.update = this.update.bind(this);

		if (prefersReducedMotion.matches) {
			return;
		}

		window.addEventListener('scroll', this.onScroll, { passive: true });
		window.addEventListener('resize', this.onScroll, { passive: true });
		this.update();

		if (!this.hasFixedAncestor && 'IntersectionObserver' in window) {
			this.observer = new window.IntersectionObserver(([entry]) => {
				this.nearViewport = entry.isIntersecting;
				if (this.nearViewport) this.onScroll();
			}, { rootMargin: '200px' });
			this.observer.observe(this.element);
		}
	}

	findFixedAncestor() {
		let ancestor = this.element.parentElement;

		while (ancestor !== null) {
			if (getComputedStyle(ancestor).position === 'fixed') {
				return true;
			}
			ancestor = ancestor.parentElement;
		}

		return false;
	}

	onScroll() {
		if (!this.nearViewport) return;

		if (this.frame === null) {
			this.frame = window.requestAnimationFrame(this.update);
		}
	}

	update() {
		this.frame = null;
		if (!this.nearViewport) return;
		let offset;
		const bounds = this.element.getBoundingClientRect();

		if (this.hasFixedAncestor) {
			offset = -window.scrollY * this.speed;
		} else {
			const viewportCenter = window.innerHeight / 2;
			const elementCenter = bounds.top + bounds.height / 2;
			offset = (elementCenter - viewportCenter) * this.speed;
		}

		this.setValue('--parallax-y', `${offset.toFixed(2)}px`);

		if (this.blur > 0) {
			// Normalize against the most that can fit onscreen, including tall figures.
			const visible = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
			const capacity = Math.min(bounds.height, window.innerHeight);
			const progress = capacity > 0 ? 1 - Math.min(1, visible / capacity) : 0;
			// Keep the photo sharp and opaque until less than half remains visible.
			const effectProgress = Math.max(0, (progress - 0.5) * 2);
			const eased = effectProgress * effectProgress * (3 - 2 * effectProgress);
			this.setValue('--viewport-blur', `${(this.blur * eased).toFixed(2)}px`);
			this.setValue('--viewport-opacity', (1 - 0.75 * eased).toFixed(3));
		}
	}

	setValue(name, value) {
		if (this.values.get(name) === value) return;
		this.values.set(name, value);
		this.element.style.setProperty(name, value);
	}

	destroy() {
		this.observer?.disconnect();
		window.removeEventListener('scroll', this.onScroll);
		window.removeEventListener('resize', this.onScroll);
		if (this.frame !== null) {
			window.cancelAnimationFrame(this.frame);
		}
	}
}
