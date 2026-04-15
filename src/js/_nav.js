export default class Nav {
	constructor() {
		this.nav = document.querySelector('.nav');
		this.navBurger = document.querySelector('.burger');
		this.navBurgerInner = document.querySelector('.burger__inner');
		
		this.navMenu = document.querySelector('.nav__menu'); 
		this.navList = document.querySelector('.nav__list');
		this.navLinks = document.querySelectorAll('.nav__list > li > a');
		this.navLinkDefault = this.navList.querySelector('.link--default') || this.navLinks[0] || null;
		this.navRect = document.querySelector('.nav__rect');
		this.navHomeActive = document.querySelector('.nav__home-btn--active');
		this.isHomeLanding = Boolean(this.navRect && this.navHomeActive && this.navList.classList.contains('nav__list--home'));

		if (this.isHomeLanding) {
			this.navRect.style.transition = 'none';
			this.navRect.style.opacity = '0';
			this.setRectToElement(this.navHomeActive);
		} else if (this.navRect && this.navLinkDefault) {
			this.navRect.style.transition = 'none';
			this.setRectToElement(this.navLinkDefault);
			this.navRect.style.opacity = '1';
		}

		window.addEventListener('load', () => {
			if (this.nav) {
				this.nav.classList.add('nav--ready');
			}
			if (this.navRect) {
				this.navRect.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
			}
		});

		this.navBurger.addEventListener('click', () => {
			this.navBurgerInner.classList.toggle('burger__inner--active');
			this.navMenu.classList.toggle('nav__menu--visible');
		});

		this.navLinks.forEach(link => {
			link.addEventListener('mouseenter', () => {
				if (!this.navRect) return;

				if (this.isHomeLanding) {
					this.navRect.style.transition = 'none';
					this.navRect.style.opacity = '0';
					this.setRectToElement(this.navHomeActive);
					this.navHomeActive.classList.add('nav__home-btn--faded');

					requestAnimationFrame(() => {
						this.navRect.style.transition = 'transform 0.2s ease, opacity 0.2s ease, width 0.2s ease';
						this.navRect.style.opacity = '1';
						this.setRectToElement(link);
					});
					return;
				}

				// apply to a slower transition only when other links are hovered
				this.navRect.style.transition = 'transform 0.2s ease, width 0.2s ease';
				this.setRectToElement(link);
			});

			link.addEventListener('mouseleave', () => {
				if (this.isHomeLanding) {
					this.navRect.style.transition = 'transform 0.2s ease, opacity 0.2s ease, width 0.2s ease';
					this.navRect.style.opacity = '0';
					this.setRectToElement(this.navHomeActive);
					this.navHomeActive.classList.remove('nav__home-btn--faded');
					return;
				}

				if (this.navRect && this.navLinkDefault) {
					this.setRectToElement(this.navLinkDefault);
				}
			});
		});

		window.addEventListener('resize', () => {
			if (!this.isHomeLanding) return;
			if (this.navRect.style.opacity !== '1') {
				this.setRectToElement(this.navHomeActive);
			}
		});
	}

	setRectToElement(element) {
		if (!this.navRect || !element) return 0;
		const elementRect = element.getBoundingClientRect();
		const navListRect = this.navList.getBoundingClientRect();
		const borderLeft = this.navList.clientLeft || 0;
		const offsetX = elementRect.left - navListRect.left - borderLeft;
		this.navRect.style.width = `${elementRect.width}px`;
		this.navRect.style.transform = `translateX(${offsetX}px)`;
	}
}
