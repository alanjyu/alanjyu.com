import {
	gsap
} from 'gsap';

export default class Burger {
	constructor(element) {
		this._menu_is_active = false;
		this._duration = .25; // transition duration

		/* Activate menu animation */

		this._toActivateMenu = gsap.timeline();
		this._toActivateMenu
			.to(
				'.burger__line:nth-child(2)', {
					opacity: 0,
					duration: this._duration
				},
				0
			)
			.to(
				'.burger__line:nth-child(1)', {
					rotation: -45,
					duration: this._duration
				},
				0
			)
			.to(
				'.burger__line:nth-child(3)', {
					rotation: 45,
					duration: this._duration
				},
				0
			)
			.to(
				'.nav', {
					translateX: '0'
				},
				0
			)
			.fromTo(
				'.nav__menu > a > li', {
					opacity: 0,
					scale: 2
				}, {
					opacity: 1,
					scale: 1,
					stagger: .1
				},
				'-=.5'
			);

		if (this._menu_is_active) {
			this._toActivateMenu.play();
		} else if (!this._menu_is_active) {
			this._toActivateMenu.reverse();
		}

		this._toActivateMenu.pause();

		this._switchToggle = document.querySelector('.js-burger');
		this._switchToggle.addEventListener('click', () => {
			this.toggleMenu();
		});
	};

	toggleMenu() {
		if (!this._menu_is_active) {
			this._menu_is_active = true;
			this._toActivateMenu.play();
		} else if (this._menu_is_active) {
			this._menu_is_active = false;
			this._toActivateMenu.reverse();
		}
	}
}