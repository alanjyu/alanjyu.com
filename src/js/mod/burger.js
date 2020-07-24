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
			'.nav',
			{
				translateX: '0'
			},
			0
		)
		.fromTo(
			'.menu > ul > a > li',
			{
				opacity: 0,
				scale: 2
			},
			{
				opacity: 1,
				scale: 1,
				stagger: .1
			},
			'-=.5'
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