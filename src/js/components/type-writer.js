import TypeIt from 'typeit';
export default class TypeWriter {
	constructor(element) {
		this.strings = [
			'Physics and environment.',
			'Career program trained.',
			'Based in Saskatoon.',
			'Welcome.'
			];

		new TypeIt(element, {
			loop: true,
			nextStringDelay: [3500, 500],
			lifeLike: true,
			breakLines: false,
			strings: this.strings,
		}).go();
	}
};