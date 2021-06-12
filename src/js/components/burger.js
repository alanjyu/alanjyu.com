import {
	gsap
} from 'gsap';

export default class Burger {
	constructor() {
		// activate menu animation
		var toActivateMenu = gsap.timeline();
		toActivateMenu
			.to(
				'.nav', {
					visibility: 'visible',
					opacity: 1
				}, 0
			)
			.to(
				'.burger', {
					opacity: 0
				}, 0
			)
			.to(
				'.menu__item__link', {
					opacity: 1,
					stagger: .05
				}, '-=.3'
			);

		toActivateMenu.pause();

		var isActive = false;

		var burgerToggle = document.querySelector('.burger');
		burgerToggle.addEventListener('click', () => {
			isActive ? (isActive = false, toActivateMenu.reverse()) : (isActive = true, toActivateMenu.play());
		});

		var navheader = document.querySelector('.navheader')
	};
}