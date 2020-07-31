import {
	gsap
} from 'gsap';

// import Tracker from './tracker';
export default class Burger {
	constructor(element) {
		this.menu_is_active = false;
		this.burger_is_locked = true;
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

		// this.toLockBurger = gsap.timeline();
		// this.toLockBurger
		// 	.to(
		// 		'.burger', {
		// 			transform: 'translateY(90vh)'
		// 		},
		// 		0
		// 	);
		
		// this.toLockBurger.pause();

		// /* tracks the absolute y-postion of mouse and
		// hides the burger menu if it is less than 100% view height */

		// let tracker = new Tracker();
		// const burger = document.querySelector('.js-burger');
		// const carouselHeight = document.querySelector('.js-carousel').offsetHeight;

		// document.addEventListener('mousemove', () => {
		
		// 	if (tracker.pageY > carouselHeight) {
		// 		this.burger_is_locked = false;
		// 	} else {
		// 		this.burger_is_locked = true;
		// 	}
		// 	this.lockBurger();
		// })

		// document.addEventListener('scroll', () => {
		// 	if (tracker.pageY > carouselHeight) {
		// 		this.burger_is_locked = false;
		// 	} else {
		// 		this.burger_is_locked = true;
		// 	}
		// 	this.lockBurger();
		// });
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

	// lockBurger() {
	// 	if (this.burger_is_locked) {
	// 		this.toLockBurger.play();
	// 	} else {
	// 		this.toLockBurger.reverse();
	// 	}
	// }
}