const breakpoints = {
	mobile: '(min-width: 478px)',
	landscape: '(min-width: 768px)',
	tablet: '(min-width: 992px)',
	desktop: '(min-width: 1200px)',
	ultrawide: '(min-width: 2000px)'
};

class BreakpointManager {
	constructor() {
		this.mediaQueries = {};
		this.listeners = new Set();
		this.handleChange = this.handleChange.bind(this);

		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return;
		}

		Object.entries(breakpoints).forEach(([name, query]) => {
			const mediaQuery = window.matchMedia(query);
			this.mediaQueries[name] = mediaQuery;

			if (typeof mediaQuery.addEventListener === 'function') {
				mediaQuery.addEventListener('change', this.handleChange);
				return;
			}

			if (typeof mediaQuery.addListener === 'function') {
				mediaQuery.addListener(this.handleChange);
			}
		});
	}

	getState() {
		return Object.fromEntries(
			Object.entries(this.mediaQueries).map(([name, mediaQuery]) => [name, mediaQuery.matches])
		);
	}

	is(name) {
		return Boolean(this.mediaQueries[name]?.matches);
	}

	onChange(callback) {
		this.listeners.add(callback);
		callback(this.getState());

		return () => {
			this.listeners.delete(callback);
		};
	}

	handleChange() {
		const state = this.getState();

		this.listeners.forEach(listener => listener(state));
	}
}

const breakpoint = new BreakpointManager();

export default breakpoint;