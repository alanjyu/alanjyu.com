export default class Header {
	constructor() {
		const headers = document.querySelectorAll('.script')
    const observer = new IntersectionObserver(
      ([e]) => e.target.classList.toggle('is_sticky', e.intersectionRatio < 1),
      { threshold: [1] }
    );
    observer.observe(headers);
	};
};

