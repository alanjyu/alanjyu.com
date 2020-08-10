import {
	gsap
} from 'gsap';

export default class ThemeToggler {
	constructor(element) {
		// this.day_mode_is_active = window.matchMedia('prefers-color-scheme: light').matches;
		this.day_mode_is_active = true;
		this.duration = .25;
		this.scale = 30;

		/* toggle attributes for the front and back 
		so that day content and night content will switch places when toggled*/
	
		this.switch_back = document.querySelector('.theme-switch--back');
		this.switch_front = document.querySelector('.theme-switch--front');

		this.switchTime = () => {
			this.switch_back.setAttribute('href', '#' + (this.day_mode_is_active ? 'theme-switch--day' : 'theme-switch--night'));
			this.switch_front.setAttribute('href', '#' + (this.day_mode_is_active ? 'theme-switch--night' : 'theme-switch--day'));
		};

		/* moving clouds and shining stars
		when .js-theme-switch is detected */

		this.stars = Array.from(document.querySelectorAll('.star'));
		this.stars.map(star =>
			gsap.to(star, {
				duration: 'random(0.4, 1.5)',
				repeat: -1,
				yoyo: true,
				opacity: 'random(0.2, 0.5)'
			})
		);

		gsap.to('.clouds--big', {
			duration: 15,
			repeat: -1,
			x: -74,
			ease: 'linear'
		});

		gsap.to('.clouds--medium', {
			duration: 20,
			repeat: -1,
			x: -65,
			ease: 'linear'
		});

		gsap.to('.clouds--small', {
			duration: 25,
			repeat: -1,
			x: -71,
			ease: 'linear'
		});

		/* switch theme if day mode is active */

		this.toNight = gsap.timeline();
		this.toNight
			.to(
				'.theme-switch--night__content', {
					duration: this.duration * 0.5,
					opacity: 1,
					ease: 'power2.inOut',
					x: 0
				},
				0
			)
			.to(
				'.theme-switch__circle', {
					duration: this.duration,
					ease: 'power4.in',
					scaleX: this.scale,
					scaleY: this.scale,
					x: 1,
					transformOrigin: '100% 50%'
				},
				0
			)
			.set(
				'.theme-switch__circle', {
					scaleX: -this.scale,
					onUpdate: () => this.switchTime()
				},
				this.duration
			)
			.to(
				'.theme-switch__circle', {
					duration: this.duration,
					ease: 'power4.out',
					scaleX: -1,
					scaleY: 1,
					x: 2
				},
				this.duration
			)
			.to(
				'[data-theme-background-dark]', {
					background: '#222831',
					duration: this.duration * 2
				},
				0
			)
			.to(
				'[data-theme-text-stroke-white]', {
					webkitTextStrokeColor: '#fff',
					duration: this.duration * 2
				},
				0
			)
			.to(
				'[data-theme-color-white]', {
					color: '#fff',
					duration: this.duration * 2
				},
				0	
			)
			.to(
				'[data-theme-background-light]', {
					background: '#fff',
					duration: this.duration * 2
				},
				0
			)
			.to(
				'[data-theme-fill]', {
					fill: '#fff',
					duration: this.duration * 2
				},
				0
			)
			.to(
				'[data-theme-border]', {
					borderColor: '#fff',
					duration: this.duration * 2
				},
				0
			)
			.to(
				'.ti-cursor', {
					color: '#ffff00',
					duration: this.duration * 2
				},
				0
			);

		if (this.day_mode_is_active) {
			this.toNight.reverse();
		} else if (!this.day_mode_is_active) {
			this.toNight.play();
		};

		this.switchToggle = document.querySelector('.js-theme-switch__input');
		this.switchToggle.addEventListener('change', () => {
			this.toggleTheme();
		});
	};

	toggleTheme() {
		if (this.day_mode_is_active) {
			this.toNight.play();
			this.day_mode_is_active = false;
		} 
		else if (!this.day_mode_is_active) {
			this.toNight.reverse();
			this.day_mode_is_active = true;
		};
	};
};