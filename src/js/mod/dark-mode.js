import {
	gsap
} from 'gsap';

function toggleTheme() {
	let duration = 0.4;
	//let isDay = window.matchMedia('(prefers-color-scheme: light)').matches;
	let isDay = true;
	let back = document.getElementById('back');
	let front = document.getElementById('front');

	let switchTime = () => {
		back.setAttribute('href', '#' + (isDay ? 'day' : 'night'));
		front.setAttribute('href', '#' + (isDay ? 'night' : 'day'));
	};
	let scale = 30;
	let toNight = gsap.timeline();

	toNight
		.to(
			'#night-content', {
				duration: duration * 0.5,
				opacity: 1,
				ease: 'power2.inOut',
				x: 0
			}
		)
		.to(
			'#circle', {
				duration: duration,
				ease: 'power4.in',
				scaleX: scale,
				scaleY: scale,
				x: 1,
				transformOrigin: '100% 50%'
			},
			0
		)
		.set(
			'#circle', {
				scaleX: -scale,
				onUpdate: () => switchTime()
			},
			duration
		)
		.to(
			'#circle', {
				duration: duration,
				ease: 'power4.out',
				scaleX: -1,
				scaleY: 1,
				x: 2
			},
			duration
		)
		.to(
			'.slide', {
				color: '#fff',
				duration: duration * 2
			},
			0
		)
		.to(
			'.nav', {
				background: '#000',
				duration: duration * 2
			},
			0
		)
		.to(
			'.menu li', {
				color: '#ffffff',
				duration: duration * 2
			},
			0
		)
		.to(
			'.social-media', {
				boxShadow: 'inset 20px 20px 60px #323232',
				duration: duration * 2
			},
			0
		)
		.to(
			'.social-media li', {
				fill: '#ffffff',
				duration: duration * 2
			},
			0
		)
		.to(
			'body', {
				background: '#000',
			},
			0
		)
		.to(
			'.burger-line', {
				background: '#fff',
				duration: duration * 2
			},
			0
		);

	let stars = Array.from(document.getElementsByClassName('star'));
	stars.map(star =>
		gsap.to(star, {
			duration: 'random(0.4, 1.5)',
			repeat: -1,
			yoyo: true,
			opacity: 'random(0.2, 0.5)'
		})
	);

	gsap.to('.clouds-big', {
		duration: 15,
		repeat: -1,
		x: -74,
		ease: 'linear'
	});
	gsap.to('.clouds-medium', {
		duration: 20,
		repeat: -1,
		x: -65,
		ease: 'linear'
	});
	gsap.to('.clouds-small', {
		duration: 25,
		repeat: -1,
		x: -71,
		ease: 'linear'
	});

	toNight.pause();

	if (isDay) {
		toNight.reverse();
	} else {
		toNight.play();
	}

	let switchToggle = document.getElementById('input');
	switchToggle.addEventListener('change', () => toggle());

	let toggle = () => {
		if (!isDay) {
			toNight.reverse();
			isDay = true;
		} else if (isDay) {
			toNight.play();
			isDay = false;
		}
	};
}

export {
	toggleTheme
};