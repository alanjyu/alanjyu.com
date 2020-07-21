function themeSwitch() {
	let duration = 0.4;
	// let isDay = window.matchMedia('(prefers-color-scheme: light)').matches;
	let isDay = true;

	let back = document.getElementById("back");
	let front = document.getElementById("front");

	let switchTime = () => {
		back.setAttribute("href", "#" + (isDay ? "day" : "night"));
		front.setAttribute("href", "#" + (isDay ? "night" : "day"));
	};
	let scale = 30;
	let toNightAnimation = gsap.timeline();

	toNightAnimation
		.to(
			"#night-content",
			{
				duration: duration * 0.5,
				opacity: 1,
				ease: "power2.inOut",
				x: 0
			}
		)
		.to(
			"#circle",
			{
				duration: duration,
				ease: "power4.in",
				scaleX: scale,
				scaleY: scale,
				x: 1,
				transformOrigin: "100% 50%"
			},
			0
		)
		.set(
			"#circle",
			{
				scaleX: -scale,
				onUpdate: () => switchTime()
			},
			duration
		)
		.to(
			"#circle",
			{
				duration: duration,
				ease: "power4.out",
				scaleX: -1,
				scaleY: 1,
				x: 2
			},
			duration
		)
		.to(
			"#day-content",
			{ 
				duration: duration * 0.5,
				opacity: 0.5 
			}, 
			duration * 1.5
		)
		.to(
			".slide",
			{
				color: "#fff",
				duration: duration * 2
			},
			0
		)
		.to(
			".overlay",
			{
				opacity: 0.5,
				duration: duration * 2
			},
			0
		)
		.to(
			"#menu",
			{
				background: "#000",
				duration: duration * 2
			},
			0
		)
		.to(
			"#menu li",
			{ 
				color: "#ffffff",
				duration: duration * 2
			},
			0
		)
		.to(
			"#vcard",
			{ 
				// boxShadow: "20px 20px 60px #323232",
				// duration: duration * 2
			},
			0
		)
		.to(
			"#social-media",
			{ 
				boxShadow: "inset 20px 20px 60px #323232",
				duration: duration * 2
			},
			0
		)
		.to(
			"#social-media li",
			{ 
				fill: "#ffffff",
				duration: duration * 2
			},
			0
		)
		.to(
			"body",
			{ 
				background: "#000",
				duration: duration * 2
			},
			0
		)
		.to(
			".burger-line",
			{
				background: "#fff",
				duration: duration * 2
			},
			0
		)
		;

	let stars = Array.from(document.getElementsByClassName("star"));
	stars.map(star =>
		gsap.to(star, {
			duration: "random(0.4, 1.5)",
			repeat: -1,
			yoyo: true,
			opacity: "random(0.2, 0.5)"
		})
	);

	gsap.to(".clouds-big", { duration: 15, repeat: -1, x: -74, ease: "linear" });
	gsap.to(".clouds-medium", { duration: 20, repeat: -1, x: -65, ease: "linear" });
	gsap.to(".clouds-small", { duration: 25, repeat: -1, x: -71, ease: "linear" });

	toNightAnimation.pause();

	if (isDay) {
		toNightAnimation.reverse();
	} else {
		toNightAnimation.play();
	}

	let switchToggle = document.getElementById("input");
	switchToggle.addEventListener("change", () => toggle());

	let toggle = () => {
		if (!isDay) {
			toNightAnimation.reverse();
			isDay = true;
		} else if (isDay) {
			toNightAnimation.play();
			isDay = false;
		}
	};
}

function menuActivation() {
	let isActive = false;
	let duration = .25
	let toActivateMenuAnimation = gsap.timeline();

	toActivateMenuAnimation
		.to(
			".burger-line:nth-child(2)",
			{
				opacity: 0,
				ease: Power2.easeInOut,
				duration: duration
			}
		)
		.to(
			".burger-line:nth-child(1)",
			{
				rotation: -45,
				duration: duration
			}
		)
		.to(
			".burger-line:nth-child(3)",
			{
				rotation: 45,
				duration: duration
			}
		)
		.fromTo(
			"#menu",
			{
				height: "0"
			},
			{
				height: "100%"
			},
			"-=.25"
		)
		.fromTo(
			"#menu li",
			{
				opacity: 0,
				scale: 2
			},
			{
				opacity: 1,
				scale: 1,
				stagger: .1
			}
		);
	
	toActivateMenuAnimation.pause();

	if (isActive) {
		toActivateMenuAnimation.play();
	} else {
		toActivateMenuAnimation.reverse();
	}

	let switchToggle = document.getElementById("burger");
	switchToggle.addEventListener("click", () => toggle());

	let toggle = () => {
		if (!isActive) {
			isActive = true;
			toActivateMenuAnimation.play();
		} else if (isActive) {
			isActive = false;
			toActivateMenuAnimation.reverse();
		}
	};
}

function typeWriter() {
	let words = new TypeIt(".typewriter", {
		loop: true,
		nextStringDelay: [3500, 500],
		lifeLike: true,
		breakLines: false,
		strings: ["A pianist.", "A drummer.", "A petrolhead.", "A struggling guitarist.", "A procrastinator.", "A physics student."],
	}).go();
};

// function scrollAnim() {
// 	// hide menu
// 	window.addEventListener('scroll', () => {
// 		const viewHeight = window.innerHeight;
// 		if (window.pageYOffset < viewHeight*.5) {
// 			document.getElementById('menu').classList.add('hidden');
// 		}
// 		else {
// 			document.getElementById('menu').classList.remove('hidden');
// 		}
// 	});
// }

// function scrollInit() {
// 	const viewHeight = window.innerHeight;
// 		if (window.pageYOffset < viewHeight*.5) {
// 			document.getElementById('menu').classList.add('hidden');
// 		}
// 		else {
// 			document.getElementById('menu').classList.remove('hidden');
// 		}
// }

lax.addPreset('fadeExit', () => {
	return { 
		'data-lax-opacity': '0 0, (vh*0.5) 1'
	}
})

document.addEventListener('DOMContentLoaded', () => {
});

window.addEventListener('load', () => {
	lax.setup();
	const updateLax = () => {
		lax.update(window.scrollY);
		window.requestAnimationFrame(updateLax);
	}

	window.requestAnimationFrame(updateLax);
	themeSwitch();
	typeWriter();
	menuActivation();
});

window.addEventListener('resize', () => {
	lax.updateElements();
});


