import TypeIt from 'typeit';
export default class TypeWriter {
	constructor(element) {
		this.strings = [
			'Environmental physics specialist.',
			'Front-end developer.',
			] || [] ;

		new TypeIt(element, {
			loop: true,
			nextStringDelay: [3500, 500],
			lifeLike: true,
			breakLines: false,
			strings: this.strings,
		}).go();
	}
};