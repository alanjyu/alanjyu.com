import TypeIt from 'typeit';
export default class TypeWriter {
	constructor(element) {
		var strings = [
			'Environmental Physics.',
			'Co-op trained.',
			'Based in Saskatoon.'
			];

		new TypeIt(element, {
			loop: true,
			nextStringDelay: [3500, 500],
			lifeLike: true,
			breakLines: false,
			strings: strings,
		}).go();
	}
};