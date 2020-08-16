import {
	gsap
} from 'gsap';

import {
	disableBodyScroll,
	enableBodyScroll,
	clearAllBodyScrollLocks
} from 'body-scroll-lock';

// import Tracker from './tracker';
export default class Burger {
	constructor(element) {
		var menuIsActive = false;
		var scrollY = document.documentElement.style.getPropertyValue('--scroll-y');

		/* Activate menu animation */

		const toActivateMenu = gsap.timeline();
		toActivateMenu
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
				'.menu__item__link', {
					opacity: 1,
					stagger: .1
				},
				'-=.25'
			);

		toActivateMenu.pause();

		const burgerToggle = document.querySelector('.js-burger');
		burgerToggle.addEventListener('click', () => {
			if (!menuIsActive) {
				scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
				menuIsActive = true;
				disableBodyScroll(document.body);
				toActivateMenu.play();
			};
		});

		const navToggle = document.querySelector('.js-nav__background');
		navToggle.addEventListener('click', () => {
			if (menuIsActive) {
				menuIsActive = false;
				window.scrollTo(0, scrollY);
				enableBodyScroll(document.body);
				toActivateMenu.reverse();
			}
		});

	};
}