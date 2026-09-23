const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export default class Parallax {
	constructor(element) {
		this.element = element;
		this.speed = Number(element.dataset.parallaxSpeed || 0.12);
		this.hasFixedAncestor = this.findFixedAncestor();
		this.frame = null;
		this.lastScrollY = window.scrollY;
		this.onScroll = this.onScroll.bind(this);
		this.update = this.update.bind(this);

		if (prefersReducedMotion.matches) {
			return;
		}

		window.addEventListener('scroll', this.onScroll, { passive: true });
		window.addEventListener('resize', this.onScroll, { passive: true });
		this.update();
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
		this.lastScrollY = window.scrollY;

		if (this.frame === null) {
			this.frame = window.requestAnimationFrame(this.update);
		}
	}

	update() {
		this.frame = null;
		let offset;

		if (this.hasFixedAncestor) {
			offset = -window.scrollY * this.speed;
		} else {
			const bounds = this.element.getBoundingClientRect();
			const viewportCenter = window.innerHeight / 2;
			const elementCenter = bounds.top + bounds.height / 2;
			offset = (elementCenter - viewportCenter) * this.speed;
		}

		this.element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
	}

	destroy() {
		window.removeEventListener('scroll', this.onScroll);
		window.removeEventListener('resize', this.onScroll);
		if (this.frame !== null) {
			window.cancelAnimationFrame(this.frame);
		}
	}
}
