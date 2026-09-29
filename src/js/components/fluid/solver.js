import Viewport from '../../utils/viewport.js';

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const GRID_WIDTH = 96;
const GRID_HEIGHT = 64;
const SOLVER_ITERATIONS = 50;
const TIME_STEP = 0.06;
const FRAME_INTERVAL = 1 / 60;
const MAX_CATCH_UP_STEPS = 3;
const VISCOSITY = 0.0008;
const THERMAL_DIFFUSIVITY = 0.0012;
const GRAVITY = 9.81;
const THERMAL_EXPANSION = 0.8;
const REFERENCE_TEMPERATURE = 0.5;
const INITIAL_ROLL_SPEED = 2.5;
const VIEW_SCALE = 1.12;
const SCROLL_ANOMALY_DISTANCE = 100;
const SCROLL_ANOMALY_RADIUS = 8;
const SCROLL_ANOMALY_STRENGTH = 0.4;
const SCROLL_VELOCITY_IMPULSE = 10;
const VIRIDIS_STOPS = [
	[68, 1, 84], [72, 40, 120], [62, 73, 137], [49, 104, 142],
	[38, 130, 142], [53, 183, 121], [110, 205, 88], [253, 231, 37]
];

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const fade = value => value * value * value * (value * (value * 6 - 15) + 10);
const fractional = value => value - Math.floor(value);

const gradientNoise = (x, y, seed) => {
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const xFraction = x - x0;
	const yFraction = y - y0;
	const gradient = (gridX, gridY) => {
		const angle = fractional(Math.sin(gridX * 127.1 + gridY * 311.7 + seed * 74.7) * 43758.5453) * Math.PI * 2;
		return [Math.cos(angle), Math.sin(angle)];
	};
	const dot = (gridX, gridY, offsetX, offsetY) => {
		const direction = gradient(gridX, gridY);
		return direction[0] * offsetX + direction[1] * offsetY;
	};
	const horizontalBlend = fade(xFraction);
	const verticalBlend = fade(yFraction);
	const top = dot(x0, y0, xFraction, yFraction) * (1 - horizontalBlend)
		+ dot(x0 + 1, y0, xFraction - 1, yFraction) * horizontalBlend;
	const bottom = dot(x0, y0 + 1, xFraction, yFraction - 1) * (1 - horizontalBlend)
		+ dot(x0 + 1, y0 + 1, xFraction - 1, yFraction - 1) * horizontalBlend;

	return top * (1 - verticalBlend) + bottom * verticalBlend;
};

const fractalNoise = (x, y, seed) => {
	let value = 0;
	let amplitude = 0.5;
	let frequency = 1;
	let amplitudeSum = 0;

	for (let octave = 0; octave < 4; octave += 1) {
		value += gradientNoise(x * frequency, y * frequency, seed + octave * 19.37) * amplitude;
		amplitudeSum += amplitude;
		frequency *= 2;
		amplitude *= 0.5;
	}

	return value / amplitudeSum;
};

// Reuse the same departure coordinates and interpolation weights for all fields.
const sample = (field, topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical) => {
	const topValue = field[topLeft] * (1 - horizontal) + field[topRight] * horizontal;
	const bottomValue = field[bottomLeft] * (1 - horizontal) + field[bottomRight] * horizontal;
	return topValue * (1 - vertical) + bottomValue * vertical;
};

export default class NavierStokesFluid {
	constructor(element) {
		if (!window.HTMLCanvasElement || !window.Float32Array) {
			throw new Error('Canvas or typed arrays are unavailable.');
		}

		this.element = element;
		this.size = GRID_WIDTH * GRID_HEIGHT;
		this.temperature = new Float32Array(this.size);
		this.velocityX = new Float32Array(this.size);
		this.velocityY = new Float32Array(this.size);
		this.pressure = new Float32Array(this.size);
		this.divergence = new Float32Array(this.size);
		this.nextTemperature = new Float32Array(this.size);
		this.nextVelocityX = new Float32Array(this.size);
		this.nextVelocityY = new Float32Array(this.size);
		this.nextPressure = new Float32Array(this.size);
		this.canvas = document.createElement('canvas');
		this.canvas.width = GRID_WIDTH;
		this.canvas.height = GRID_HEIGHT;
		this.canvas.setAttribute('aria-hidden', 'true');
		this.canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;transform:scale(${VIEW_SCALE});transform-origin:center;pointer-events:none;`;
		this.context = this.canvas.getContext('2d', { alpha: true });
		if (!this.context) {
			throw new Error('A 2D canvas context is unavailable.');
		}
		this.element.append(this.canvas);
		this.image = this.context.createImageData(GRID_WIDTH, GRID_HEIGHT);
		for (let pixel = 3; pixel < this.image.data.length; pixel += 4) {
			this.image.data[pixel] = 145;
		}
		this.randomizeInitialState();
		this.frame = null;
		this.lastTime = 0;
		this.accumulatedTime = 0;
		this.isPageVisible = !document.hidden;
		this.lastScrollY = Math.max(0, window.scrollY);
		this.pendingScrollDistance = 0;
		this.onScroll = this.onScroll.bind(this);
		this.onVisibilityChange = this.onVisibilityChange.bind(this);
		this.onViewportChange = this.onViewportChange.bind(this);
		this.update = this.update.bind(this);
		this.viewport = new Viewport(this.element, this.onViewportChange);
		document.addEventListener('visibilitychange', this.onVisibilityChange, { passive: true });
		window.addEventListener('scroll', this.onScroll, { passive: true });
		this.render();
	}

	randomizeInitialState() {
		const temperatureBias = (Math.random() - 0.5) * 0.2;
		const noiseAmplitude = 0.15 + Math.random() * 0.2;
		const noiseFrequency = 0.02 + Math.random() * 0.06;
		const noiseSeed = Math.random() * 10000;
		const rollDirection = Math.random() < 0.5 ? -1 : 1;
		const bandAngle = Math.random() * Math.PI;
		const bandX = Math.cos(bandAngle);
		const bandY = Math.sin(bandAngle);
		const bandFrequency = 0.06 + Math.random() * 0.12;
		const bandPhase = Math.random() * Math.PI * 2;
		const bandAmplitude = Math.random() < 0.5 ? 0 : 0.1 + Math.random() * 0.15;
		const firstSign = Math.random() < 0.5 ? -1 : 1;
		// Alternating signs guarantee both warm and cold anomalies in every start.
		const anomalies = Array.from({ length: 4 + Math.floor(Math.random() * 6) }, (_, index) => {
			const angle = Math.random() * Math.PI;
			return {
				x: GRID_WIDTH * (0.08 + Math.random() * 0.84),
				y: GRID_HEIGHT * (0.12 + Math.random() * 0.76),
				radiusX: 4 + Math.random() * 18,
				radiusY: 3 + Math.random() * 12,
				cosine: Math.cos(angle),
				sine: Math.sin(angle),
				strength: firstSign * (index % 2 === 0 ? 1 : -1) * (0.25 + Math.random() * 0.3)
			};
		});
		for (let y = 0; y < GRID_HEIGHT; y += 1) {
			const verticalPosition = y / (GRID_HEIGHT - 1);
			// Fade disturbances smoothly into the fixed-temperature top and bottom.
			const boundaryEnvelope = Math.sin(Math.PI * verticalPosition);
			for (let x = 0; x < GRID_WIDTH; x += 1) {
				const index = y * GRID_WIDTH + x;
				let anomaly = 0;
				for (const patch of anomalies) {
					const dx = x - patch.x;
					const dy = y - patch.y;
					const along = (dx * patch.cosine + dy * patch.sine) / patch.radiusX;
					const across = (-dx * patch.sine + dy * patch.cosine) / patch.radiusY;
					anomaly += patch.strength * Math.exp(-(along * along + across * across));
				}
				const streamX = Math.PI * x / (GRID_WIDTH - 1);
				const streamY = Math.PI * y / (GRID_HEIGHT - 1);
				const coherentNoise = fractalNoise(x * noiseFrequency, y * noiseFrequency, noiseSeed);
				const bands = Math.sin((x * bandX + y * bandY) * bandFrequency + bandPhase + coherentNoise) * bandAmplitude;
				this.temperature[index] = clamp(
					verticalPosition + boundaryEnvelope * (temperatureBias + anomaly + bands + coherentNoise * noiseAmplitude),
					0,
					1
				);
				this.velocityX[index] = rollDirection * INITIAL_ROLL_SPEED * Math.sin(streamX) * Math.cos(streamY);
				this.velocityY[index] = -rollDirection * INITIAL_ROLL_SPEED * Math.cos(streamX) * Math.sin(streamY);
			}
		}
		this.applyBoundaries();
	}

	onViewportChange(isVisible) {
		this.isVisible = isVisible;
		this.toggleAnimation();
	}

	onVisibilityChange() {
		this.isPageVisible = !document.hidden;
		this.toggleAnimation();
	}

	onScroll() {
		const scrollY = clamp(window.scrollY, 0, Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
		const distance = scrollY - this.lastScrollY;
		this.lastScrollY = scrollY;
		if (!this.isVisible || !this.isPageVisible || reducedMotionQuery.matches) return;

		// Accumulate distance, not events, so touch, wheel and keyboard scrolling agree.
		// Discard the previous direction's remainder when scrolling reverses.
		if (distance * this.pendingScrollDistance < 0) this.pendingScrollDistance = 0;
		this.pendingScrollDistance = clamp(
			this.pendingScrollDistance + distance,
			-SCROLL_ANOMALY_DISTANCE * 2,
			SCROLL_ANOMALY_DISTANCE * 2
		);
	}

	addScrollAnomalies(direction) {
		// Launch warm plumes from the bottom or cold plumes from the top.
		// Keep the fixed-temperature boundary cells untouched.
		const patches = Array.from({ length: 2 }, () => ({
			x: GRID_WIDTH * (0.15 + Math.random() * 0.7),
			y: direction > 0 ? GRID_HEIGHT - 2 : 1,
			sign: direction
		}));
		for (const patch of patches) {
			for (let y = Math.max(1, Math.floor(patch.y - SCROLL_ANOMALY_RADIUS)); y <= Math.min(GRID_HEIGHT - 2, Math.ceil(patch.y + SCROLL_ANOMALY_RADIUS)); y += 1) {
				for (let x = Math.max(1, Math.floor(patch.x - SCROLL_ANOMALY_RADIUS)); x <= Math.min(GRID_WIDTH - 2, Math.ceil(patch.x + SCROLL_ANOMALY_RADIUS)); x += 1) {
					const radiusSquared = ((x - patch.x) ** 2 + (y - patch.y) ** 2) / SCROLL_ANOMALY_RADIUS ** 2;
					if (radiusSquared >= 1) continue;
					const index = y * GRID_WIDTH + x;
					const falloff = (1 - radiusSquared) ** 2;
					const anomaly = patch.sign * SCROLL_ANOMALY_STRENGTH * falloff;
					this.temperature[index] = clamp(this.temperature[index] + anomaly, 0, 1);
					this.velocityY[index] -= direction * SCROLL_VELOCITY_IMPULSE * falloff;
				}
			}
		}
	}

	toggleAnimation() {
		const shouldAnimate = this.isVisible && this.isPageVisible && !reducedMotionQuery.matches;
		if (!shouldAnimate) this.pendingScrollDistance = 0;
		if (shouldAnimate && this.frame === null) {
			this.lastTime = performance.now();
			this.accumulatedTime = 0;
			this.frame = requestAnimationFrame(this.update);
		} else if (!shouldAnimate && this.frame !== null) {
			cancelAnimationFrame(this.frame);
			this.frame = null;
		}
	}

	update(now) {
		this.frame = null;
		const elapsed = Math.max(0, (now - this.lastTime) / 1000);
		this.lastTime = now;
		this.accumulatedTime = Math.min(this.accumulatedTime + elapsed, FRAME_INTERVAL * MAX_CATCH_UP_STEPS);
		let advanced = false;
		// Preserve the previous 60 Hz pace on every display, with bounded catch-up work.
		while (this.accumulatedTime + 1e-9 >= FRAME_INTERVAL) {
			if (Math.abs(this.pendingScrollDistance) >= SCROLL_ANOMALY_DISTANCE) {
				const direction = Math.sign(this.pendingScrollDistance);
				this.pendingScrollDistance -= direction * SCROLL_ANOMALY_DISTANCE;
				this.addScrollAnomalies(direction);
			}
			this.step(TIME_STEP * 0.5);
			this.accumulatedTime = Math.max(0, this.accumulatedTime - FRAME_INTERVAL);
			advanced = true;
		}
		if (advanced) this.render();
		this.frame = requestAnimationFrame(this.update);
		this.toggleAnimation();
	}

	step(delta) {
		const timeStep = Math.min(delta, TIME_STEP);
		for (let index = 0; index < this.size; index += 1) {
			const densityDifference = THERMAL_EXPANSION * (this.temperature[index] - REFERENCE_TEMPERATURE);
			this.velocityY[index] -= GRAVITY * densityDifference * timeStep;
		}
		this.advect(timeStep);
		// Diffusion reads this buffer, so it needs the same thermal walls as the live field.
		this.applyThermalBoundaries(this.nextTemperature);
		this.diffuse(this.nextVelocityX, this.velocityX, VISCOSITY, timeStep);
		this.diffuse(this.nextVelocityY, this.velocityY, VISCOSITY, timeStep);
		this.diffuse(this.nextTemperature, this.temperature, THERMAL_DIFFUSIVITY, timeStep);
		this.projectVelocity();
		this.applyBoundaries();
	}

	advect(delta) {
		const { velocityX, velocityY, temperature, nextVelocityX, nextVelocityY, nextTemperature } = this;
		for (let y = 1; y < GRID_HEIGHT - 1; y += 1) {
			const row = y * GRID_WIDTH;
			for (let x = 1; x < GRID_WIDTH - 1; x += 1) {
				const index = row + x;
				const previousX = clamp(x - velocityX[index] * delta, 1, GRID_WIDTH - 2);
				const previousY = clamp(y - velocityY[index] * delta, 1, GRID_HEIGHT - 2);
				const left = Math.floor(previousX);
				const top = Math.floor(previousY);
				const topLeft = top * GRID_WIDTH + left;
				const topRight = topLeft + 1;
				const bottomLeft = topLeft + GRID_WIDTH;
				const bottomRight = bottomLeft + 1;
				const horizontal = previousX - left;
				const vertical = previousY - top;
				nextVelocityX[index] = sample(velocityX, topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical);
				nextVelocityY[index] = sample(velocityY, topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical);
				nextTemperature[index] = sample(temperature, topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical);
			}
		}
	}

	diffuse(source, destination, coefficient, delta) {
		const amount = coefficient * delta;
		for (let y = 1; y < GRID_HEIGHT - 1; y += 1) {
			for (let x = 1; x < GRID_WIDTH - 1; x += 1) {
				const index = y * GRID_WIDTH + x;
				const neighbors = source[index - 1] + source[index + 1] + source[index - GRID_WIDTH] + source[index + GRID_WIDTH];
				destination[index] = (source[index] + amount * neighbors) / (1 + amount * 4);
			}
		}
	}

	projectVelocity() {
		const { velocityX, velocityY, divergence } = this;
		let { pressure, nextPressure } = this;
		for (let y = 1; y < GRID_HEIGHT - 1; y += 1) {
			for (let x = 1; x < GRID_WIDTH - 1; x += 1) {
				const index = y * GRID_WIDTH + x;
				divergence[index] = -0.5 * (velocityX[index + 1] - velocityX[index - 1] + velocityY[index + GRID_WIDTH] - velocityY[index - GRID_WIDTH]);
				pressure[index] = 0;
			}
		}
		for (let iteration = 0; iteration < SOLVER_ITERATIONS; iteration += 1) {
			this.applyPressureBoundaries(pressure);
			for (let y = 1; y < GRID_HEIGHT - 1; y += 1) {
				for (let x = 1; x < GRID_WIDTH - 1; x += 1) {
					const index = y * GRID_WIDTH + x;
					nextPressure[index] = (divergence[index] + pressure[index - 1] + pressure[index + 1] + pressure[index - GRID_WIDTH] + pressure[index + GRID_WIDTH]) * 0.25;
				}
			}
			const previousPressure = pressure;
			pressure = nextPressure;
			nextPressure = previousPressure;
		}
		for (let y = 1; y < GRID_HEIGHT - 1; y += 1) {
			for (let x = 1; x < GRID_WIDTH - 1; x += 1) {
				const index = y * GRID_WIDTH + x;
				velocityX[index] -= 0.5 * (pressure[index + 1] - pressure[index - 1]);
				velocityY[index] -= 0.5 * (pressure[index + GRID_WIDTH] - pressure[index - GRID_WIDTH]);
			}
		}
		this.applyPressureBoundaries(pressure);
		this.pressure = pressure;
		this.nextPressure = nextPressure;
		this.applyNoPenetrationVelocity();
	}

  applyBoundaries() {
    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      const left = y * GRID_WIDTH;
      const right = left + GRID_WIDTH - 1;
  
      // No-slip sidewalls
      this.velocityX[left] = 0;
      this.velocityY[left] = this.velocityY[left + 1];
  
      this.velocityX[right] = 0;
      this.velocityY[right] = this.velocityY[right - 1];
    }
  
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const top = x;
      const bottom = (GRID_HEIGHT - 1) * GRID_WIDTH + x;
  
      // No-slip top and bottom
      this.velocityX[top] = this.velocityX[top + GRID_WIDTH];
      this.velocityY[top] = 0;
  
      this.velocityX[bottom] = this.velocityX[bottom - GRID_WIDTH];
      this.velocityY[bottom] = 0;
    }
    this.applyThermalBoundaries(this.temperature);
  }

	applyThermalBoundaries(temperature) {
		for (let y = 1; y < GRID_HEIGHT - 1; y += 1) {
			const left = y * GRID_WIDTH;
			const right = left + GRID_WIDTH - 1;
			// Insulating sidewalls: zero horizontal temperature gradient.
			temperature[left] = temperature[left + 1];
			temperature[right] = temperature[right - 1];
		}
		for (let x = 0; x < GRID_WIDTH; x += 1) {
			temperature[x] = 0; // Cold top.
			temperature[(GRID_HEIGHT - 1) * GRID_WIDTH + x] = 1; // Hot bottom.
		}
	}

	applyPressureBoundaries(pressure = this.pressure) {
		for (let y = 0; y < GRID_HEIGHT; y += 1) {
			const left = y * GRID_WIDTH;
			const right = left + GRID_WIDTH - 1;
			pressure[left] = pressure[left + 1];
			pressure[right] = pressure[right - 1];
		}
		for (let x = 0; x < GRID_WIDTH; x += 1) {
			pressure[x] = pressure[x + GRID_WIDTH];
			pressure[(GRID_HEIGHT - 1) * GRID_WIDTH + x] = pressure[(GRID_HEIGHT - 2) * GRID_WIDTH + x];
		}
	}

	applyNoPenetrationVelocity() {
		for (let y = 1; y < GRID_HEIGHT - 1; y += 1) {
			const left = y * GRID_WIDTH + 1;
			const right = y * GRID_WIDTH + GRID_WIDTH - 2;
			this.velocityX[left] = Math.min(this.velocityX[left], 0);
			this.velocityX[right] = Math.max(this.velocityX[right], 0);
		}
		for (let x = 1; x < GRID_WIDTH - 1; x += 1) {
			const top = GRID_WIDTH + x;
			const bottom = (GRID_HEIGHT - 2) * GRID_WIDTH + x;
			this.velocityY[top] = Math.max(this.velocityY[top], 0);
			this.velocityY[bottom] = Math.min(this.velocityY[bottom], 0);
		}
	}
	render() {
		const { temperature } = this;
		const pixels = this.image.data;
		for (let index = 0; index < this.size; index += 1) {
			const position = clamp(temperature[index], 0, 1) * (VIRIDIS_STOPS.length - 1);
			const lower = Math.floor(position);
			const lowerColor = VIRIDIS_STOPS[lower];
			const upperColor = VIRIDIS_STOPS[Math.min(lower + 1, VIRIDIS_STOPS.length - 1)];
			const amount = position - lower;
			const pixel = index * 4;
			pixels[pixel] = Math.round(lowerColor[0] + (upperColor[0] - lowerColor[0]) * amount);
			pixels[pixel + 1] = Math.round(lowerColor[1] + (upperColor[1] - lowerColor[1]) * amount);
			pixels[pixel + 2] = Math.round(lowerColor[2] + (upperColor[2] - lowerColor[2]) * amount);
		}
		this.context.putImageData(this.image, 0, 0);
	}

	destroy() {
		if (this.frame !== null) cancelAnimationFrame(this.frame);
		this.viewport.destroy();
		document.removeEventListener('visibilitychange', this.onVisibilityChange);
		window.removeEventListener('scroll', this.onScroll);
		this.canvas.remove();
	}
}
