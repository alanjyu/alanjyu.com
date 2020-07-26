import TypeIt from 'typeit';

function typeWriter() {
	let words = new TypeIt('.typewriter', {
		loop: true,
		nextStringDelay: [3500, 500],
		lifeLike: true,
		breakLines: false,
		strings: ['A pianist.', 'A drummer.', 'A petrolhead.', 'A struggling guitarist.', 'A procrastinator.', 'A physics student.'],
	}).go();
};

export {typeWriter};