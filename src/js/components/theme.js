export default class Theme {
	constructor() {
		var sections = document.querySelectorAll('section');
		var main = document.querySelector('main');

		sections.forEach(section => {
			var tp = section.offsetTop; // top position
			var bg = section.dataset.backgroundcolor; // background color obtained from html

			document.addEventListener('scroll', () => {
				if (window.pageYOffset > tp) {
					main.style.backgroundColor = bg;
				}
			});

		});
	};
};