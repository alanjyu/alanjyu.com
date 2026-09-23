import Viewport from './components/viewport.js';

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const ELEMENT_EXTENT = 100;
const FIELD_BOUNDARY = ELEMENT_EXTENT;
const FIELD_SIZE = FIELD_BOUNDARY * 2;
const CRITICAL_RAYLEIGH = 1708;
const CONVECTION_PROBABILITY = 0.3;
const VIRIDIS_STOPS = [
	[68, 1, 84],
	[72, 40, 120],
	[62, 73, 137],
	[49, 104, 142],
	[38, 130, 142],
	[53, 183, 121],
	[110, 205, 88],
	[253, 231, 37]
];

const blobPhases = [0.2, 1.8, 3.4, 4.8];

const createInitialBlobs = () => blobPhases.map(phase => ({
 x: Math.random() * FIELD_SIZE - FIELD_BOUNDARY,
 y: Math.random() * FIELD_SIZE - FIELD_BOUNDARY,
	vx: Math.random() * 0.8 - 0.4,
	vy: Math.random() * 0.8 - 0.4,
	temperature: Math.random(),
	phase: phase + Math.random() * 0.8 - 0.4
}));

const getViridisColor = temperature => {
	const palettePosition = Math.max(0, Math.min(1, temperature)) * (VIRIDIS_STOPS.length - 1);
	const lowerIndex = Math.floor(palettePosition);
	const upperIndex = Math.min(lowerIndex + 1, VIRIDIS_STOPS.length - 1);
	const interpolation = palettePosition - lowerIndex;
	const lowerStop = VIRIDIS_STOPS[lowerIndex];
	const upperStop = VIRIDIS_STOPS[upperIndex];
	const red = Math.round(lowerStop[0] + (upperStop[0] - lowerStop[0]) * interpolation);
	const green = Math.round(lowerStop[1] + (upperStop[1] - lowerStop[1]) * interpolation);
	const blue = Math.round(lowerStop[2] + (upperStop[2] - lowerStop[2]) * interpolation);

	return `rgb(${red} ${green} ${blue} / 0.62)`;
};

export default class FluidBackground {
	constructor(element) {
		this.element = element;
		this.blobs = createInitialBlobs();
		this.boundaryTemperature = Math.random() * 0.7 + 0.15;
		this.bottomTemperatureBias = Math.random() * 0.2 + 0.35;
		this.rayleighNumber = Math.random() < CONVECTION_PROBABILITY
			? CRITICAL_RAYLEIGH * (1.25 + Math.random() * 2.25)
			: CRITICAL_RAYLEIGH * (0.15 + Math.random() * 0.7);
		this.convectionStrength = Math.max(0, this.rayleighNumber / CRITICAL_RAYLEIGH - 1);
		this.frame = null;
		this.lastTime = 0;
		this.isPageVisible = !document.hidden;
		this.onVisibilityChange = this.onVisibilityChange.bind(this);
		this.onViewportChange = this.onViewportChange.bind(this);
		this.update = this.update.bind(this);
		this.viewport = new Viewport(this.element, this.onViewportChange);
		document.addEventListener('visibilitychange', this.onVisibilityChange, { passive: true });

		this.render();
	}

	onViewportChange(isVisible) {
		this.isVisible = isVisible;
		this.toggleAnimation();
	}

	onVisibilityChange() {
		this.isPageVisible = !document.hidden;
		this.toggleAnimation();
	}

	toggleAnimation() {
		const shouldAnimate = this.isVisible && this.isPageVisible && !reducedMotionQuery.matches;

		if (shouldAnimate && this.frame === null) {
			this.lastTime = performance.now();
			this.frame = window.requestAnimationFrame(this.update);
		} else if (!shouldAnimate && this.frame !== null) {
			window.cancelAnimationFrame(this.frame);
			this.frame = null;
		}
	}

	update(now) {
		this.frame = null;
		const delta = Math.min((now - this.lastTime) / 1000, 0.033);
		this.lastTime = now;
		const time = now / 1000;

		this.updateThermalField(time, delta);
		this.applyBuoyancyAndCurl(time, delta);
		this.applyPressureForces(delta);
		this.integrateVelocity(delta);
		this.integratePosition(delta);

		this.render();
		this.toggleAnimation();
	}

	updateThermalField(time, delta) {
		this.blobs.forEach(blob => {
			const targetTemperature = this.getBoundaryTemperature(blob.y, time, blob.phase);

			blob.temperature += (targetTemperature - blob.temperature) * delta * 0.08;
		});
	}

	applyBuoyancyAndCurl(time, delta) {
		this.blobs.forEach(blob => {
			const temperatureDifference = blob.temperature - this.boundaryTemperature;
			const thermalGradient = temperatureDifference * (0.8 - blob.y / FIELD_BOUNDARY);
			const buoyancy = thermalGradient * (0.012 + this.convectionStrength * 0.02);
			const thermalConvection = temperatureDifference * this.convectionStrength * 0.45;
			const curlX = Math.sin(blob.y * 0.035 + time * 0.11 + blob.phase) * 1.1;
			const curlY = Math.cos(blob.x * 0.03 - time * 0.09 + blob.phase) * 1.1;

			blob.vx += (curlX + buoyancy * 0.7) * delta;
			blob.vy += (curlY - buoyancy - thermalConvection) * delta;
		});
	}

	getBoundaryTemperature(y, time, phase) {
		const verticalPosition = (y + FIELD_BOUNDARY) / FIELD_SIZE;
		const boundaryPulse = Math.sin(time * 0.08 + phase) * 0.25;
		const bottomHeating = this.bottomTemperatureBias * verticalPosition;

		return Math.max(0, Math.min(1, this.boundaryTemperature + bottomHeating + boundaryPulse));
	}

	applyPressureForces(delta) {
		for (let index = 0; index < this.blobs.length; index += 1) {
			for (let otherIndex = index + 1; otherIndex < this.blobs.length; otherIndex += 1) {
				const blob = this.blobs[index];
				const other = this.blobs[otherIndex];
				const dx = other.x - blob.x;
				const dy = other.y - blob.y;
				const distanceSquared = Math.max(dx * dx + dy * dy, 36);
				const pressure = 0.08 / distanceSquared;

				blob.vx -= dx * pressure * delta;
				blob.vy -= dy * pressure * delta;
				other.vx += dx * pressure * delta;
				other.vy += dy * pressure * delta;
			}
		}
	}

	integrateVelocity(delta) {
		this.blobs.forEach(blob => {
			blob.vx += -blob.vx * 0.22 * delta;
			blob.vy += -blob.vy * 0.22 * delta;
		});
	}

	integratePosition(delta) {
		this.blobs.forEach(blob => {
			blob.x = this.wrapPosition(blob.x + blob.vx * delta);
			blob.y = this.wrapPosition(blob.y + blob.vy * delta);
		});
	}

	wrapPosition(position) {
		return ((position + FIELD_BOUNDARY) % FIELD_SIZE) - FIELD_BOUNDARY;
	}

	render() {
		const positions = this.blobs.map(blob => `${blob.x.toFixed(2)}vmax ${blob.y.toFixed(2)}vmax`).join(', ');
		const colors = this.blobs.map(blob => getViridisColor(blob.temperature));

		this.element.style.setProperty('--fluid-position', positions);
		colors.forEach((color, index) => {
			this.element.style.setProperty(`--fluid-color-${index + 1}`, color);
		});
	}

	destroy() {
		if (this.frame !== null) {
			window.cancelAnimationFrame(this.frame);
		}
		this.viewport.destroy();
		document.removeEventListener('visibilitychange', this.onVisibilityChange);
	}
}
