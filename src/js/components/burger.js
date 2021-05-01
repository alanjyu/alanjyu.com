import {
	gsap
} from 'gsap';

export default class Burger {
	constructor() {
		// activate menu animation
		var toActivateMenu = gsap.timeline();
		toActivateMenu
			.to(
				'.header', {
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
				}, '-=.1'
			);

		toActivateMenu.reversed(true);

		var burgerToggle = document.querySelector('.burger');
		burgerToggle.addEventListener('click', () => {
			toActivateMenu.reversed() ? toActivateMenu.play() : toActivateMenu.reverse();
		});

		var body = document.querySelector('main');
		body.addEventListener('click', () => {
			toActivateMenu.play() ? toActivateMenu.reverse() : toActivateMenu.play();
		});
	};
}