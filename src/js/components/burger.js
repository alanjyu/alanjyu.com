import {
	gsap
} from 'gsap';

import Tracker from './tracker';
export default class Burger {
	constructor(element) {
		this.menu_is_active = false;
		this.burger_is_active = false;
		this.duration = .25; // transition duration

		/* Activate menu animation */

		this.toActivateMenu = gsap.timeline();
		this.toActivateMenu
			.to(
				'.burger__line:nth-child(2)', {
					opacity: 0,
					duration: this.duration
				},
				0
			)
			.to(
				'.burger__line:nth-child(1)', {
					rotation: -45,
					duration: this.duration
				},
				0
			)
			.to(
				'.burger__line:nth-child(3)', {
					rotation: 45,
					duration: this.duration
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

		this.toActivateBurger = gsap.timeline();
		this.toActivateBurger
			.fromTo(
				'.burger', {
					display: 'none',
					opacity: 0
				},
				{
					display: 'flex',
					opacity: 1
				},
				0
			);
		
		this.toActivateBurger.pause();

		/* tracks the absolute y-postion of mouse and
		hides the burger menu if it is less than 100% view height */

		let tracker = new Tracker();
		const burger = document.querySelector('.js-burger');
		const carouselHeight = document.querySelector('.js-carousel').offsetHeight;

		document.addEventListener('mousemove', () => {
			if (tracker.pageY > carouselHeight) {
				this.burger_is_active = true;
			} else {
				this.burger_is_active = false;
			}
			this.displayBurger();
		})

		document.addEventListener('scroll', () => {
			if (tracker.pageY > carouselHeight) {
				this.burger_is_active = true;
			} else {
				this.burger_is_active = false;
			}
			this.displayBurger();
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

	displayBurger() {
		if (this.burger_is_active) {
			this.toActivateBurger.play();
		} else {
			this.toActivateBurger.reverse();
		}
	}
}