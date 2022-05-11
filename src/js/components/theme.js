export default class Theme {
	constructor() {
		var sections = document.querySelectorAll('section');
		var dimpoint = document.querySelector('#music');
		var main = document.querySelector('main');

		main.style.backgroundColor = '#f5f5f5';

		sections.forEach(section => {
			var tp = section.offsetTop; // top position
			var bg = section.dataset.backgroundcolor; // background color obtained from html
			var buffer = 75;

			document.addEventListener('scroll', () => {
				if (window.pageYOffset > (tp - buffer)) {
					main.style.backgroundColor = bg;

					// if (window.pageYOffset > (dimpoint - buffer)) {
					// 	main.style.color = '#fff';
					// 	console.log('trigger!');
					// }
				}
			});

		});
	};
};