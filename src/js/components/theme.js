import {
	gsap
} from 'gsap';

export default class ThemeToggler {
	constructor(e) {
		var isLight = window.matchMedia('prefers-color-scheme: light').matches;

		var toNight = gsap.timeline();
		toNight
			.to(
				['body'], {
					background: '#15191e'
				}, 0
			)
			.to(
				['[data-theme="light color"]'], {
					color: '#fff',
				}, 0
			)
			.to(
				'[data-theme="light background"]', {
					background: '#fff',
				}, 0
			)
			.to(
				'[data-theme-fill]', {
					fill: '#fff',
				}, 0
			)
			.to(
				'.cursor', {
					borderColor: '#fff',
				}, 0
			)
			.to(
				'.neu-box', {
					boxShadow: '5px 5px 10px #12151a, -5px -5px 10px #181d23',
				},
				0
			)
			.to(
				'.ti-cursor', {
					color: '#ffff00',
				}, 0
			);

		if (isLight) {
			toNight.reverse();
		} else {
			toNight.play();
		};

		const switchToggle = document.querySelector('.theme-switch');
		switchToggle.addEventListener('click', () => {
			if (isLight) {
				toNight.play();
				isLight = false;
			} 
			else {
				toNight.reverse();
				isLight = true;
			};
		});
	};
};