import breakpoint from './components/breakpoint.js';

export default class Nav {
	constructor() {
		this.nav = document.querySelector('.nav');
		this.navList = document.querySelector('.nav__list');
		this.navLinks = document.querySelectorAll('.nav__link');
		this.navLinkDefault = document.querySelector('.nav__link--default');
		this.navRect = document.querySelector('.nav__rect');
		this.homeButton = document.querySelector('#home-button');
		this.homeButtonRect = document.querySelector('.home__rect');
		this.navMenu = document.querySelector('.nav__menu');
		this.isHomeLanding = Boolean(this.homeButton && this.homeButton.classList.contains('nav__link--default'));
		this.activeTarget = this.navLinkDefault;
		this.resizeObserver = null;

		this.bindEvents();
		breakpoint.onChange(() => this.init());
		this.init();
	}

	bindEvents() {
		if (!this.homeButton) {
			return;
		}

		this.navLinks.forEach(link => {
			link.addEventListener('pointerenter', () => this.setActiveTarget(link));
			link.addEventListener('pointerleave', () => {
				this.setActiveTarget(this.navLinkDefault);
				if (!this.isHomeLanding) {
					this.homeButtonRect.classList.remove('home__rect--is-visible');
				}
			});
		});

		this.homeButton.addEventListener('pointerenter', () => {
			this.setActiveTarget(this.homeButton);
			if (!this.isHomeLanding) {
				this.homeButtonRect.classList.add('home__rect--is-visible');
			}
		});

		this.homeButton.addEventListener('pointerleave', () => {
			this.setActiveTarget(this.navLinkDefault);
			if (!this.isHomeLanding) {
				this.homeButtonRect.classList.remove('home__rect--is-visible');
			}
		});

		if (this.navMenu) {
			this.navMenu.addEventListener('click', () => {
				this.navMenu.classList.toggle('nav__menu--is-open');
			});
		}
	}

	init() {
		if (!this.navRect || !this.navList || !this.navLinkDefault || !this.homeButtonRect || !this.homeButton) {
			return;
		}

		this.activeTarget = this.navLinkDefault;
		this.updateRects();
		this.navRect.classList.add('nav__rect--is-visible');
		this.homeButtonRect.classList.add('home__rect--is-visible');
		this.observeLayout();

		if (!this.isHomeLanding) {
			this.navLinkDefault.style.background = 'inherit';
		}

		if (this.navMenu) {
			this.updateMobileMenuHeight();

			if (breakpoint.is('landscape')) {
				this.navMenu.classList.remove('nav__menu--is-open');
			}
		}
	}

	setActiveTarget(target) {
		this.activeTarget = target;
		this.updateRects();
	}

	updateRects() {
		const target = this.activeTarget || this.navLinkDefault;
		this.setRectToElement(this.navRect, this.navList, target);
		this.setRectToElement(this.homeButtonRect, this.homeButton, target);
	}

	setRectToElement(rect, reference, target) {
		const referenceBounds = reference.getBoundingClientRect();
		const targetBounds = target.getBoundingClientRect();
		const offsetX = targetBounds.left - referenceBounds.left - reference.clientLeft;

		rect.style.setProperty('--rect-width', `${targetBounds.width}px`);
		rect.style.setProperty('--rect-offset-x', `${offsetX}px`);
	}

	observeLayout() {
		if (typeof ResizeObserver === 'undefined') {
			return;
		}

		this.resizeObserver?.disconnect();
		this.resizeObserver = new ResizeObserver(() => this.updateRects());
		this.resizeObserver.observe(this.navList);
		this.resizeObserver.observe(this.homeButton);
	}

	updateMobileMenuHeight() {
		const numItems = this.navMenu.querySelectorAll('.nav__item').length;
		const itemHeight = this.navMenu.querySelector('.nav__item')?.getBoundingClientRect().height || 0;

		this.navMenu.style.setProperty('--menu-height', `${itemHeight * numItems}px`);
	}
}