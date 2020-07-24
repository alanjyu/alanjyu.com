import { gsap } from 'gsap';

function toggleMenu() {
	let isActive = false;
	let duration = .25
	let toActivateMenu = gsap.timeline();

	toActivateMenu
		.to(
			'.burger-line:nth-child(2)',
			{
				opacity: 0,
				duration: duration
			},
			0
		)
		.to(
			'.burger-line:nth-child(1)',
			{
				rotation: -45,
				duration: duration
			},
			0
		)
		.to(
			'.burger-line:nth-child(3)',
			{
				rotation: 45,
				duration: duration
			},
			0
		)
		.to(
			'#nav',
			{
				display: 'block',
				width: '100%'
			},
			0
		)
		.to(
			'.menu',
			{
				display: 'flex',
				opacity: '1'
			},
			0
		)
		.fromTo(
			'.menu li',
			{
				opacity: 0,
				scale: 2
			},
			{
				opacity: 1,
				scale: 1,
				stagger: .1
			},
			'-=.75'
		)
		.fromTo(
			'.switch',
			{
				opacity: '0'
			},
			{
				opacity: '1'
			},
			'-=.1'
		);
	
	toActivateMenu.pause();

	if (isActive) {
		toActivateMenu.play();
	} else {
		toActivateMenu.reverse();
	}

	let switchToggle = document.querySelector('.burger');
	switchToggle.addEventListener('click', () => toggle());

	let toggle = () => {
		if (!isActive) {
			isActive = true;
			toActivateMenu.play();
		} else if (isActive) {
			isActive = false;
			toActivateMenu.reverse();
		}
	};
}

export {toggleMenu};