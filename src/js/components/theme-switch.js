import {
	gsap
} from 'gsap';

export default class ThemeToggler {
	constructor(element) {
		this._day_mode_is_active = window.matchMedia('prefers-color-scheme: light').matches;
		this._duration = .25;
		this._scale = 30;

		/* toggle attributes for the front and back 
		so that day content and night content will switch places when toggled*/
	
		this._switch_back = document.querySelector('.theme-switch--back');
		this._switch_front = document.querySelector('.theme-switch--front');

		this._switchTime = () => {
			this._switch_back.setAttribute('href', '#' + (this._day_mode_is_active ? 'theme-switch--day' : 'theme-switch--night'));
			this._switch_front.setAttribute('href', '#' + (this._day_mode_is_active ? 'theme-switch--night' : 'theme-switch--day'));
		};

		/* moving clouds and shining stars
		when .js-theme-switch is detected */

		this._stars = Array.from(document.querySelectorAll('.star'));
		this._stars.map(star =>
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

		this._toNight = gsap.timeline();
		this._toNight
			.to(
				'.theme-switch--night__content', {
					duration: this._duration * 0.5,
					opacity: 1,
					ease: 'power2.inOut',
					x: 0
				}
			)
			.to(
				'.theme-switch__circle', {
					duration: this._duration,
					ease: 'power4.in',
					scaleX: this._scale,
					scaleY: this._scale,
					x: 1,
					transformOrigin: '100% 50%'
				},
				0
			)
			.set(
				'.theme-switch__circle', {
					scaleX: -this._scale,
					onUpdate: () => this._switchTime()
				},
				this._duration
			)
			.to(
				'.theme-switch__circle', {
					duration: this._duration,
					ease: 'power4.out',
					scaleX: -1,
					scaleY: 1,
					x: 2
				},
				this._duration
			)
			.to(
				'.slide', {
					color: '#fff',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'.burger__line', {
					background: '#fff',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'.nav', {
					background: '#000',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'.nav__menu__item__link', {
					color: '#fff',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'.social-media__item__link', {
					fill: '#fff',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'.mouse-scroll__icon', {
					stroke: '#fff',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'.ti-cursor', {
					color: '#ffff00',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'.carousel__canvas__photo > img', {
					filter: 'brightness(.6)',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'.highlight', {
					color: '#fff',
					duration: this._duration * 2
				},
				0
			)
			.to(
				'body', {
					background: '#000',
				},
				0
			);

		if (this._day_mode_is_active) {
			this._toNight.reverse();
		} else if (!this._day_mode_is_active) {
			this._toNight.play();
		};

		this._switchToggle = document.querySelector('.js-theme-switch__input');
		this._switchToggle.addEventListener('change', () => {
			this.toggleTheme();
		});
	};

	toggleTheme() {
		if (this._day_mode_is_active) {
			this._toNight.play();
			this._day_mode_is_active = false;
		} 
		else if (!this._day_mode_is_active) {
			this._toNight.reverse();
			this._day_mode_is_active = true;
		};
	};
};