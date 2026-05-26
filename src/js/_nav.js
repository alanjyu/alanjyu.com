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

		this.bindEvents();
		breakpoint.onChange(() => this.init());
		this.init();
	}

	bindEvents() {
		this.navLinks.forEach(link => {
			link.addEventListener('mouseover', (e) => {
				this.setRectToElement(this.navRect, this.navList, e.currentTarget);
				this.setRectToElement(this.homeButtonRect, this.homeButton, e.currentTarget);
			});

			link.addEventListener('mouseout', () => {
				this.setRectToElement(this.navRect, this.navList, this.navLinkDefault);
				this.setRectToElement(this.homeButtonRect, this.homeButton, this.navLinkDefault);

				if (!this.isHomeLanding) {
					this.homeButtonRect.classList.remove('home__rect--visible');
				}
			});
		});

		this.homeButton.addEventListener('mouseover', (e) => {
			this.setRectToElement(this.navRect, this.navList, e.currentTarget);
			this.setRectToElement(this.homeButtonRect, this.homeButton, e.currentTarget);
			if (!this.isHomeLanding) {
				this.homeButtonRect.classList.add('home__rect--visible');
			}
		});

		this.homeButton.addEventListener('mouseout', () => {
			this.setRectToElement(this.navRect, this.navList, this.navLinkDefault);
			this.setRectToElement(this.homeButtonRect, this.homeButton, this.navLinkDefault);
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

		this.setRectToElement(this.navRect, this.navList, this.navLinkDefault);
		this.setRectToElement(this.homeButtonRect, this.homeButton, this.navLinkDefault);
		this.navRect.classList.add('nav__rect--visible');
		this.homeButtonRect.classList.add('home__rect--visible');

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

	setRectToElement(src, ref, target) {
		const refCoors = ref.getBoundingClientRect();
		const refLeftBorder = ref.clientLeft || 0;
		const targetCoors = target.getBoundingClientRect();
		const offsetX = targetCoors.left - refCoors.left - refLeftBorder;

		src.style.setProperty('--rect-width', `${targetCoors.width}px`);
		src.style.setProperty('--rect-offset-x', `${offsetX}px`);
	}

	updateMobileMenuHeight() {
		const numItems = this.navMenu.querySelectorAll('.nav__item').length;
		const itemHeight = this.navMenu.querySelector('.nav__item')?.getBoundingClientRect().height || 0;

		this.navMenu.style.setProperty('--menu-height', `${itemHeight * numItems}px`);
	}
}