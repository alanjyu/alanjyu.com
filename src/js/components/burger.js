import {
	gsap
} from 'gsap';

// import Tracker from './tracker';
export default class Burger {
	constructor(element) {
		this.menu_is_active = false;
		this.duration = .25; // transition duration

		/* Activate menu animation */

		this.toActivateMenu = gsap.timeline();
		this.toActivateMenu
			.to(
				'.nav', {
					opacity: 1,
					zIndex: 'var(--z-above)'
				},
				0
			)
			.to(
				'.nav__background', {
					display: 'block',
					opacity: 1
				},
				0
			)
			.to(
				'.menu__item', {
					opacity: 1,
					stagger: .1
				},
				'-=.25'
			)
			.to(
				'.theme-switch', {
					opacity: 1
				},
				'-=.25'
			);

		if (this.menu_is_active) {
			this.toActivateMenu.play();
		} else if (!this.menu_is_active) {
			this.toActivateMenu.reverse();
		}

		this.toActivateMenu.pause();

		this.burgerToggle = document.querySelector('.js-burger');
		this.burgerToggle.addEventListener('click', () => {
			if (!this.menu_is_active) {
				this.menu_is_active = true;
				this.toActivateMenu.play();
			};
		});

		this.navToggle = document.querySelector('.js-nav__background');
		this.navToggle.addEventListener('click', () => {
			if (this.menu_is_active) {
				this.menu_is_active = false;
				this.toActivateMenu.reverse();
			}
		});
	};
}