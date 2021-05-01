import {
	gsap
} from 'gsap';

export default class ThemeToggler {
	constructor() {
		var toNight = gsap.timeline();
		toNight
			.to(
				['body','.content','.content__tight'], {
					background: '#000'
				}, 0
			)
			.to(
				['h1','h2','h3','h4','h5','h6','p'], {
					color: '#fff'
				}, 0
			)
			.to(
				['.content__inner'], {
					background: '#121212'
				}, 0
			)
			.to(
				['.burger__line', '.timeline__line'], {
					background: '#fff',
				}, 0
			)
			.to(
				['object'], {
					filter: 'invert(1)',
				}, 0
			)
			.to(
				'.cursor', {
					borderColor: '#fff',
				}, 0
			);
		
		toNight.pause();
		var isLight = window.matchMedia('prefers-color-scheme: light').matches;
		isLight ? toNight.reverse() : toNight.play();

		const switchToggle = document.querySelector('.themeswitch');
		switchToggle.addEventListener('click', () => {
			isLight ? (isLight = false, toNight.play()) : (isLight = true,	toNight.reverse());
		});
	};
};