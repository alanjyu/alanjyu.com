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
					translateX: '0'
				},
				0
			)
			.fromTo(
				'.nav__menu__item__link', {
					opacity: 0,
					scale: 2
				}, {
					opacity: 1,
					scale: 1,
					stagger: .1
				},
				'-=.5'
			);

		if (this.menu_is_active) {
			this.toActivateMenu.play();
		} else if (!this.menu_is_active) {
			this.toActivateMenu.reverse();
		}

		this.toActivateMenu.pause();

		this.switchToggle = document.querySelector('.js-burger');
		this.switchToggle.addEventListener('click', () => {
			this.toggleMenu();
		});
	};

	toggleMenu() {
		if (!this.menu_is_active) {
			this.menu_is_active = true;
			this.toActivateMenu.play();
		} else if (this.menu_is_active) {
			this.menu_is_active = false;
			this.toActivateMenu.reverse();
		}
	}
}