import {
	gsap
} from 'gsap';

export default class Burger {
	constructor() {
		var menuIsActive = false;

		// activate menu animation
		const toActivateMenu = gsap.timeline();
		toActivateMenu
			.to(
				'.header', {
					visibility: 'visible',
					opacity: 1
				},
				0
			)
			.to(
				'.menu__item__link', {
					opacity: 1,
					stagger: .1
				},
				'-=.15'
			);

		toActivateMenu.pause();

		const burgerToggle = document.querySelector('.burger');
		burgerToggle.addEventListener('click', () => {
			if (!menuIsActive) {
				menuIsActive;
				toActivateMenu.play();
			};
		});
	};
}