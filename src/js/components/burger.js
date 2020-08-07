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
			.fromTo(
				'.nav', {
					opacity: 0,
					zIndex: 'var(--z-below)'
				}, {
					opacity: 1,
					zIndex: 'var(--z-above)'
				},
				0
			)
			.fromTo(
				'.nav__background', {
					display: 'none',
					opacity: 0
				}, {
					
					display: 'block',
					opacity: 1
				},
				0
			)
			.fromTo(
				'.menu__item', {
					opacity: 0,
					scale: 2
				}, {
					opacity: 1,
					scale: 1,
					stagger: .1
				},
				'-=.25'
			)
			.fromTo(
				'.theme-switch', {
					opacity: 0
				}, {
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

		this.navToggle = document.querySelector('.js-nav');
		this.navToggle.addEventListener('click', () => {
			if (this.menu_is_active) {
				this.menu_is_active = false;
				this.toActivateMenu.reverse();
			}
		});
	};
}