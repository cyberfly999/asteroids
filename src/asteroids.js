/**
 * Represents the player's spaceship, managing its movement physics,
 * rendering, boundary wrapping, and invulnerability states.
 */
export class Ship {
	/**
	 * Creates a new Ship instance at specified coordinates.
	 * @param {number} x - Initial X coordinate.
	 * @param {number} y - Initial Y coordinate.
	 */
	constructor(x, y) {
		// Current 2D position in world space
		this.pos = {x, y};
		// Current linear velocity vector in pixels per second
		this.vel = {x: 0, y: 0};
		// Orientation angle in radians (-Math.PI / 2 points straight up)
		this.angle = -Math.PI / 2;
		// Collision radius for hit detection
		this.radius = 14;
		// Whether thruster acceleration is currently active
		this.thrusting = false;
		// Remaining duration (in seconds) of temporary invulnerability (e.g. after respawn)
		this.invulnerable = 0;
	}

	/**
	 * Updates the ship's physics, position, and timers for a single frame.
	 * @param {number} dt - Delta time elapsed since last frame in seconds.
	 * @param {number} [w] - Screen width boundary.
	 * @param {number} [h] - Screen height boundary.
	 */
	update(dt, w = AsteroidsGame.W, h = AsteroidsGame.H) {
		// Apply acceleration in the direction the ship is facing when thrusting
		if (this.thrusting) {
			const a = this.angle;
			this.vel.x += Math.cos(a) * 300 * dt;
			this.vel.y += Math.sin(a) * 300 * dt;
		}
		// Apply simulated space friction / drag (frame-rate independent decay)
		this.vel.x *= Math.pow(0.99, dt * 60);
		this.vel.y *= Math.pow(0.99, dt * 60);
		// Integrate velocity into position
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;
		// Wrap around screen boundaries if leaving the visible area
		this.wrap(w, h);
		// Count down invulnerability timer
		if (this.invulnerable > 0) this.invulnerable -= dt;
	}

	/**
	 * Wraps ship position to opposite edge when crossing screen boundaries,
	 * using a padding margin of 20 pixels so the ship smoothly exits before wrapping.
	 * @param {number} [w] - Screen width boundary.
	 * @param {number} [h] - Screen height boundary.
	 */
	wrap(w = AsteroidsGame.W, h = AsteroidsGame.H) {
		if (this.pos.x < -20) this.pos.x = w + 20;
		if (this.pos.x > w + 20) this.pos.x = -20;
		if (this.pos.y < -20) this.pos.y = h + 20;
		if (this.pos.y > h + 20) this.pos.y = -20;
	}

	/**
	 * Renders the ship and thruster flame to the canvas context.
	 * @param {CanvasRenderingContext2D} ctx - Target 2D rendering context.
	 */
	draw(ctx) {
		ctx.save();
		// Translate canvas origin to ship position and rotate to ship heading
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.angle);
		// Flash/blink ship opacity when invulnerable (every 100ms)
		ctx.globalAlpha = this.invulnerable > 0 && Math.floor(performance.now() / 100) % 2 ? 0.3 : 1;
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		// Draw triangular ship wireframe
		ctx.beginPath();
		ctx.moveTo(18, 0);       // Nose
		ctx.lineTo(-12, -10);    // Left wing tip
		ctx.lineTo(-8, 0);       // Inner engine notch
		ctx.lineTo(-12, 10);     // Right wing tip
		ctx.closePath();
		ctx.stroke();
		// Draw thruster flame attached to inner engine notch when thrusting
		if (this.thrusting) {
			ctx.fillStyle = '#abeaf3';
			ctx.beginPath();
			ctx.moveTo(-8, 0);      // Base directly attached at engine notch
			ctx.lineTo(-18, 4);     // Flame tip right
			ctx.lineTo(-18, -4);    // Flame tip left
			ctx.closePath();
			ctx.fill();
		}
		ctx.restore();
	}
}

/**
 * Represents an individual asteroid obstacle that drifts, rotates,
 * and splits into smaller pieces when destroyed.
 */
export class Asteroid {
	/**
	 * Creates a new Asteroid instance.
	 * @param {number} x - Initial X coordinate.
	 * @param {number} y - Initial Y coordinate.
	 * @param {number} radius - Base radius determining overall size.
	 * @param {number} level - Asteroid tier (2 = large, 1 = medium, 0 = small).
	 * @param {number} [speedMultiplier=1] - Speed scale factor for wave difficulty.
	 */
	constructor(x, y, radius, level = 2, speedMultiplier = 1) {
		// Position in world space
		this.pos = {x, y};
		this.speedMultiplier = speedMultiplier;
		// Randomized linear velocity vector scaled by speedMultiplier
		const speed = 80 * speedMultiplier;
		this.vel = {x: (Math.random() - 0.5) * speed, y: (Math.random() - 0.5) * speed};
		// Base collision and rendering radius
		this.radius = radius;
		// Hierarchy level determining split behavior and point value
		this.level = level;
		// Current rotational angle in radians
		this.rotation = Math.random() * Math.PI * 2;
		// Rotational speed in radians per second (-1 to +1 rad/sec)
		this.rotSpeed = (Math.random() - 0.5) * 2;
		// Procedural jaggedness vertex multipliers (8 to 13 points, 0.7x to 1.3x radius)
		this.points = Array.from({length: 8 + Math.floor(Math.random() * 6)}, () => 0.7 + Math.random() * 0.6);
	}

	/**
	 * Updates the asteroid's linear position and rotation angle over time.
	 * @param {number} dt - Delta time elapsed since last frame in seconds.
	 * @param {number} [w] - Screen width boundary.
	 * @param {number} [h] - Screen height boundary.
	 */
	update(dt, w = AsteroidsGame.W, h = AsteroidsGame.H) {
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;
		this.rotation += this.rotSpeed * dt;
		this.wrap(w, h);
	}

	/**
	 * Wraps asteroid position across screen boundaries with a 50px buffer.
	 * @param {number} [w] - Screen width boundary.
	 * @param {number} [h] - Screen height boundary.
	 */
	wrap(w = AsteroidsGame.W, h = AsteroidsGame.H) {
		if (this.pos.x < -50) this.pos.x = w + 50;
		if (this.pos.x > w + 50) this.pos.x = -50;
		if (this.pos.y < -50) this.pos.y = h + 50;
		if (this.pos.y > h + 50) this.pos.y = -50;
	}

	/**
	 * Draws the procedural jagged polygon shape of the asteroid.
	 * @param {CanvasRenderingContext2D} ctx - Target 2D rendering context.
	 */
	draw(ctx) {
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.rotation);
		ctx.strokeStyle = '#ccc';
		ctx.lineWidth = 2;
		ctx.beginPath();
		// Connect procedural jagged vertices around the circumference
		for (let i = 0; i < this.points.length; i++) {
			const a = i / this.points.length * Math.PI * 2;
			const r = this.radius * this.points[i];
			const x = Math.cos(a) * r, y = Math.sin(a) * r;
			if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	/**
	 * Splits this asteroid into two smaller child asteroids if level > 0.
	 * @returns {Asteroid[]} Array of newly created child asteroids (empty if level was 0).
	 */
	split() {
		// Smallest asteroids do not split further
		if (this.level <= 0) return [];
		const r = this.radius * 0.5;
		return [
			new Asteroid(this.pos.x, this.pos.y, r, this.level - 1, this.speedMultiplier),
			new Asteroid(this.pos.x, this.pos.y, r, this.level - 1, this.speedMultiplier)
		];
	}
}

/**
 * Represents a high-speed projectile fired from the player's ship.
 */
export class Bullet {
	/**
	 * Creates a new Bullet instance.
	 * @param {number} x - Spawn X coordinate (at ship nose).
	 * @param {number} y - Spawn Y coordinate (at ship nose).
	 * @param {number} angle - Firing direction angle in radians.
	 */
	constructor(x, y, angle) {
		// Current position
		this.pos = {x, y};
		// Linear velocity vector computed from firing angle (600 px/sec speed)
		this.vel = {x: Math.cos(angle) * 600, y: Math.sin(angle) * 600};
		// Remaining lifetime in seconds before despawning
		this.life = 2;
		// Hitbox radius
		this.radius = 2;
	}

	/**
	 * Advances bullet along its trajectory and decreases its remaining lifetime.
	 * @param {number} dt - Delta time elapsed since last frame in seconds.
	 */
	update(dt) {
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;
		this.life -= dt;
	}

	/**
	 * Renders the bullet as a small white circle.
	 * @param {CanvasRenderingContext2D} ctx - Target 2D rendering context.
	 */
	draw(ctx) {
		ctx.fillStyle = '#fff';
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2);
		ctx.fill();
	}
}

/**
 * Represents a transient visual particle used in explosion and debris effects.
 */
export class Particle {
	/**
	 * Creates a new Particle instance with randomized velocity and lifetime.
	 * @param {number} x - Spawn X coordinate.
	 * @param {number} y - Spawn Y coordinate.
	 */
	constructor(x, y) {
		// Current particle position
		this.pos = {x, y};
		// Randomized dispersion velocity vector (-100 to +100 px/sec)
		this.vel = {x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200};
		// Randomized lifetime in seconds (0.5 to 1.0 seconds)
		this.life = 0.5 + Math.random() * 0.5;
	}

	/**
	 * Moves particle along its velocity vector and reduces its lifetime.
	 * @param {number} dt - Delta time elapsed since last frame in seconds.
	 */
	update(dt) {
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;
		this.life -= dt;
	}

	/**
	 * Draws the particle as a tiny colored square.
	 * @param {CanvasRenderingContext2D} ctx - Target 2D rendering context.
	 */
	draw(ctx) {
		ctx.fillStyle = '#ffaa55';
		ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
	}
}

/**
 * Main game engine class managing canvas rendering, user input, game state,
 * entity lifecycles, physics simulation, collision detection, and audio/UI updates.
 */
export default class AsteroidsGame {
	// Canvas logical width in pixels
	static W = 0;
	// Canvas logical height in pixels
	static H = 0;

	/**
	 * Initializes the Asteroids game instance and attaches event listeners.
	 * @param {HTMLCanvasElement} canvas - The HTML5 canvas element for game rendering.
	 */
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.stars = [];

		// Track currently pressed keys using a Set
		this.keys = new Set();

		// Game progression and status state
		this.score = 0;
		this.wave = 1;
		this.lives = 3;
		this.high = this.loadHighScore();
		this.paused = false;
		this.gameOver = false;
		this.running = true;

		// Set initial dimensions and starfield based on container/window
		this.resize();

		// Active game entity collections
		this.asteroids = [];
		this.bullets = [];
		this.particles = [];
		this.ship = new Ship(AsteroidsGame.W / 2, AsteroidsGame.H / 2);
		this.ship.invulnerable = 2;
		// Timestamp of last bullet fired (ms) for fire rate throttling
		this.lastShot = 0;

		// Spawn initial asteroid wave
		this.spawnAsteroidsForWave();

		// Cache DOM UI elements
		this.uiScore = document.getElementById('score');
		this.uiWave = document.getElementById('wave');
		this.uiLives = document.getElementById('lives');
		this.uiHigh = document.getElementById('high');
		this.pauseBtn = document.getElementById('pause');
		this.restartBtn = document.getElementById('restart');

		// Bind event handlers
		this.setupEventListeners();
		this.updateUI();

		// Start game animation loop
		this.loop = this.loop.bind(this);
		this.animId = requestAnimationFrame(this.loop);
	}

	/**
	 * Safely reads the high score from localStorage with exception handling.
	 * @returns {number} The recorded high score or 0.
	 */
	loadHighScore() {
		try {
			return +localStorage.getItem('asteroids_high') || 0;
		} catch (e) {
			return 0;
		}
	}

	/**
	 * Safely saves the high score to localStorage with exception handling.
	 */
	saveHighScore() {
		try {
			localStorage.setItem('asteroids_high', this.high);
		} catch (e) {
			// Suppress errors in restricted/private browsing modes
		}
	}

	/**
	 * Attaches window and UI input listeners, preserving function references for cleanup.
	 */
	setupEventListeners() {
		this.onResize = () => this.resize();
		window.addEventListener('resize', this.onResize);

		this.onKeyDown = (e) => {
			this.keys.add(e.code);
			// Prevent page scroll for common gameplay keys
			if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
				e.preventDefault();
			}
			// Toggle pause on KeyP
			if (e.code === 'KeyP') {
				this.togglePause();
			}
			// Restart on Enter or Space when game is over
			if (this.gameOver && (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyR')) {
				this.reset();
			}
		};
		window.addEventListener('keydown', this.onKeyDown);

		this.onKeyUp = (e) => this.keys.delete(e.code);
		window.addEventListener('keyup', this.onKeyUp);

		if (this.pauseBtn) {
			this.onPauseClick = () => {
				this.togglePause();
			};
			this.pauseBtn.addEventListener('click', this.onPauseClick);
		}

		if (this.restartBtn) {
			this.onRestartClick = () => {
				this.reset();
			};
			this.restartBtn.addEventListener('click', this.onRestartClick);
		}

		// Setup on-screen mobile / touch controls
		this.touchHandlers = [];
		const bindTouch = (id, keyCode) => {
			const el = document.getElementById(id);
			if (!el) return;

			const start = (e) => {
				e.preventDefault();
				if (this.gameOver) {
					this.reset();
					return;
				}
				this.keys.add(keyCode);
				el.classList.add('active');
			};

			const end = (e) => {
				e.preventDefault();
				this.keys.delete(keyCode);
				el.classList.remove('active');
			};

			el.addEventListener('touchstart', start, {passive: false});
			el.addEventListener('touchend', end, {passive: false});
			el.addEventListener('touchcancel', end, {passive: false});
			el.addEventListener('mousedown', start);
			el.addEventListener('mouseup', end);
			el.addEventListener('mouseleave', end);

			this.touchHandlers.push({el, start, end});
		};

		bindTouch('touch-left', 'ArrowLeft');
		bindTouch('touch-right', 'ArrowRight');
		bindTouch('touch-thrust', 'ArrowUp');
		bindTouch('touch-fire', 'Space');
	}

	/**
	 * Cleans up all attached event listeners and halts the animation loop.
	 */
	destroy() {
		this.running = false;
		if (this.animId) {
			cancelAnimationFrame(this.animId);
			this.animId = null;
		}

		window.removeEventListener('resize', this.onResize);
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);

		if (this.pauseBtn && this.onPauseClick) {
			this.pauseBtn.removeEventListener('click', this.onPauseClick);
		}
		if (this.restartBtn && this.onRestartClick) {
			this.restartBtn.removeEventListener('click', this.onRestartClick);
		}

		if (this.touchHandlers) {
			for (const h of this.touchHandlers) {
				h.el.removeEventListener('touchstart', h.start);
				h.el.removeEventListener('touchend', h.end);
				h.el.removeEventListener('touchcancel', h.end);
				h.el.removeEventListener('mousedown', h.start);
				h.el.removeEventListener('mouseup', h.end);
				h.el.removeEventListener('mouseleave', h.end);
			}
			this.touchHandlers = [];
		}
	}

	/**
	 * Toggles the pause state of the game simulation and updates UI text.
	 */
	togglePause() {
		if (this.gameOver) return;
		this.paused = !this.paused;
		if (this.pauseBtn) {
			this.pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
			this.pauseBtn.blur();
		}
	}

	/**
	 * Handles canvas resize events and High-DPI (Retina) screen scaling.
	 * Adjusts canvas internal buffer dimensions while maintaining CSS size.
	 */
	resize() {
		const dpr = window.devicePixelRatio || 1;
		const w = this.canvas.clientWidth || window.innerWidth || 800;
		const h = this.canvas.clientHeight || window.innerHeight || 600;
		this.canvas.width = w * dpr;
		this.canvas.height = h * dpr;
		this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		AsteroidsGame.W = w;
		AsteroidsGame.H = h;
		this.generateStars(w, h);
	}

	/**
	 * Precomputes deterministic integer star coordinates to eliminate per-frame subpixel overhead.
	 * @param {number} w - Screen width.
	 * @param {number} h - Screen height.
	 */
	generateStars(w, h) {
		this.stars = [];
		const safeW = Math.max(1, w);
		const safeH = Math.max(1, h);
		for (let i = 0; i < 80; i++) {
			this.stars.push({
				x: Math.floor((i * 137.5) % safeW),
				y: Math.floor((i * 73.3) % safeH)
			});
		}
	}

	/**
	 * Spawns asteroids scaled for the current wave difficulty.
	 */
	spawnAsteroidsForWave() {
		const count = Math.min(12, 4 + this.wave * 2);
		const speedMultiplier = 1 + (this.wave - 1) * 0.15;
		this.spawnAsteroids(count, speedMultiplier);
	}

	/**
	 * Populates the game world with a given number of large asteroids,
	 * ensuring they do not spawn inside the player's safe starting zone.
	 * @param {number} n - Number of asteroids to spawn.
	 * @param {number} [speedMultiplier=1] - Asteroid drift velocity scale factor.
	 */
	spawnAsteroids(n, speedMultiplier = 1) {
		this.asteroids = [];
		const w = AsteroidsGame.W || 800;
		const h = AsteroidsGame.H || 600;
		const shipX = this.ship ? this.ship.pos.x : w / 2;
		const shipY = this.ship ? this.ship.pos.y : h / 2;
		const safeRadius = Math.min(150, Math.min(w, h) * 0.35);

		for (let i = 0; i < n; i++) {
			let x, y;
			let attempts = 0;
			// Keep picking random coordinates until outside the safe zone or iteration cap reached
			do {
				x = Math.random() * w;
				y = Math.random() * h;
				attempts++;
			} while (attempts < 50 && Math.hypot(x - shipX, y - shipY) < safeRadius);
			this.asteroids.push(new Asteroid(x, y, 40 + Math.random() * 30, 2, speedMultiplier));
		}
	}

	/**
	 * Resets all gameplay variables, clears active projectiles/particles,
	 * resets ship position to screen center, and spawns a fresh asteroid wave.
	 */
	reset() {
		this.score = 0;
		this.wave = 1;
		this.lives = 3;
		this.paused = false;
		this.gameOver = false;
		const w = AsteroidsGame.W || 800;
		const h = AsteroidsGame.H || 600;
		this.ship = new Ship(w / 2, h / 2);
		this.ship.invulnerable = 2; // 2 seconds of spawn protection
		this.bullets = [];
		this.particles = [];
		this.keys.clear();
		this.lastShot = 0;
		this.spawnAsteroidsForWave();
		if (this.pauseBtn) this.pauseBtn.textContent = 'Pause';
		this.updateUI();
		// Remove focus from buttons so keyboard controls work seamlessly
		if (document.activeElement && typeof document.activeElement.blur === 'function') {
			document.activeElement.blur();
		}
	}

	/**
	 * Synchronizes the game state values (score, wave, lives, high score) with DOM UI elements.
	 */
	updateUI() {
		if (this.uiScore) this.uiScore.textContent = `Score: ${this.score}`;
		if (this.uiWave) this.uiWave.textContent = `Wave: ${this.wave}`;
		if (this.uiLives) this.uiLives.textContent = `Lives: ${this.lives}`;
		if (this.uiHigh) this.uiHigh.textContent = `High: ${this.high}`;
	}

	/**
	 * Main game loop called on every animation frame via requestAnimationFrame.
	 * Calculates frame delta time, steps game simulation if unpaused, and renders frame.
	 * @param {DOMHighResTimeStamp} ts - Current animation timestamp in milliseconds.
	 */
	loop(ts) {
		if (!this.running) return;
		if (!this._last) this._last = ts;
		// Compute delta time in seconds, clamped to max 33ms (~30 FPS) to prevent physics glitching on lag
		const dt = Math.min(0.033, (ts - this._last) / 1000);
		this._last = ts;
		if (!this.paused) this.update(dt);
		this.draw();
		this.animId = requestAnimationFrame(this.loop);
	}

	/**
	 * Executes core game logic, user input handling, physics updates,
	 * collision detection, entity lifecycle cleanup, and wave progression.
	 * @param {number} dt - Frame delta time in seconds.
	 */
	update(dt) {
		const w = AsteroidsGame.W || 800;
		const h = AsteroidsGame.H || 600;
		const s = this.ship;

		if (s && !this.gameOver) {
			// Handle ship rotation input (Left/Right or A/D keys)
			if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) s.angle -= 3 * dt;
			if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) s.angle += 3 * dt;

			// Handle forward thrust input (Up or W keys strictly; Space is reserved for shooting)
			s.thrusting = this.keys.has('ArrowUp') || this.keys.has('KeyW');
			s.update(dt, w, h);

			// Handle active braking/reverse dampening with frame-rate independent scaling (Down or S keys)
			if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) {
				const brakeDecay = Math.pow(0.98, dt * 60);
				s.vel.x *= brakeDecay;
				s.vel.y *= brakeDecay;
			}

			// Handle firing bullets with cooldown throttling (180ms minimum interval)
			if (this.keys.has('Space') || this.keys.has('KeyJ')) {
				if (performance.now() - this.lastShot > 180) {
					this.lastShot = performance.now();
					// Spawn bullet at the tip/nose of the ship (18px along heading angle)
					this.bullets.push(new Bullet(s.pos.x + Math.cos(s.angle) * 18, s.pos.y + Math.sin(s.angle) * 18, s.angle));
				}
			}
		}

		// Update bullets and prune expired ones
		this.bullets.forEach(b => b.update(dt));
		this.bullets = this.bullets.filter(b => b.life > 0);

		// Update asteroid positions and rotations
		this.asteroids.forEach(a => a.update(dt, w, h));

		// Update explosion particles and prune expired ones
		this.particles.forEach(p => p.update(dt));
		this.particles = this.particles.filter(p => p.life > 0);

		// Check collisions: Bullet vs Asteroid (point-to-circle collision)
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			for (let j = this.asteroids.length - 1; j >= 0; j--) {
				const b = this.bullets[i], a = this.asteroids[j];
				if (Math.hypot(b.pos.x - a.pos.x, b.pos.y - a.pos.y) < a.radius) {
					// Remove the colliding bullet
					this.bullets.splice(i, 1);
					// Split asteroid into smaller fragments
					const kids = a.split();
					this.asteroids.splice(j, 1);
					this.asteroids.push(...kids);
					// Award points based on asteroid tier (Level 2: 20pts, Level 1: 50pts, Level 0: 100pts)
					this.score += a.level === 2 ? 20 : a.level === 1 ? 50 : 100;
					// Spawn debris explosion particles at collision point
					for (let k = 0; k < 12; k++) this.particles.push(new Particle(a.pos.x, a.pos.y));
					break;
				}
			}
		}

		// Check collisions: Ship vs Asteroid (circle-to-circle collision)
		if (s && !this.gameOver && s.invulnerable <= 0) {
			for (const a of this.asteroids) {
				if (Math.hypot(s.pos.x - a.pos.x, s.pos.y - a.pos.y) < a.radius + s.radius) {
					this.explodeShip();
					break;
				}
			}
		}

		// Wave completion check: grant wave bonus and advance wave if all asteroids destroyed
		if (this.asteroids.length === 0 && !this.gameOver) {
			this.score += 1000 * this.wave;
			this.wave++;
			this.spawnAsteroidsForWave();
		}

		// Update high score in local storage if current score exceeds previous high
		if (this.score > this.high) {
			this.high = this.score;
			this.saveHighScore();
		}
		this.updateUI();
	}

	/**
	 * Handles ship destruction event: spawns explosion particle burst,
	 * decrements player lives, and either triggers game over or respawns ship.
	 */
	explodeShip() {
		if (!this.ship) return;
		// Spawn particle explosion burst
		for (let i = 0; i < 60; i++) this.particles.push(new Particle(this.ship.pos.x, this.ship.pos.y));
		this.lives--;
		if (this.lives <= 0) {
			// Set game over state; keep particles animating and display Game Over screen
			this.gameOver = true;
			this.ship = null;
		} else {
			// Respawn ship at screen center with temporary invulnerability shield
			const w = AsteroidsGame.W || 800;
			const h = AsteroidsGame.H || 600;
			this.ship = new Ship(w / 2, h / 2);
			this.ship.invulnerable = 2;
		}
	}

	/**
	 * Renders the entire game scene including background starfield,
	 * asteroids, bullets, particle effects, the player ship, and overlays.
	 */
	draw() {
		const ctx = this.ctx;
		const w = AsteroidsGame.W || 800;
		const h = AsteroidsGame.H || 600;

		// Clear canvas with space black
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, w, h);

		// Render precomputed starfield background (80 stars)
		ctx.fillStyle = '#fff';
		for (let i = 0; i < this.stars.length; i++) {
			ctx.fillRect(this.stars[i].x, this.stars[i].y, 1, 1);
		}

		// Render all dynamic game entities
		this.asteroids.forEach(a => a.draw(ctx));
		this.bullets.forEach(b => b.draw(ctx));
		this.particles.forEach(p => p.draw(ctx));
		if (this.ship) {
			this.ship.draw(ctx);
		}

		// Render Pause Overlay
		if (this.paused && !this.gameOver) {
			ctx.save();
			ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = '#fff';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = 'bold 42px system-ui, sans-serif';
			ctx.fillText('PAUSED', w / 2, h / 2 - 20);
			ctx.font = '16px system-ui, sans-serif';
			ctx.fillStyle = '#ccc';
			ctx.fillText('Click Resume or press P to continue', w / 2, h / 2 + 25);
			ctx.restore();
		}

		// Render Game Over Overlay
		if (this.gameOver) {
			ctx.save();
			ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			ctx.fillRect(0, 0, w, h);

			// Pulsating GAME OVER text
			ctx.save();
			const pulse = 1 + 0.08 * Math.sin(performance.now() / 200);
			ctx.translate(w / 2, h / 2 - 40);
			ctx.scale(pulse, pulse);
			ctx.fillStyle = '#ff4444';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = 'bold 48px system-ui, sans-serif';
			ctx.fillText('GAME OVER', 0, 0);
			ctx.restore();

			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = '20px system-ui, sans-serif';
			ctx.fillText(`Final Score: ${this.score}`, w / 2, h / 2 + 10);
			ctx.font = '16px system-ui, sans-serif';
			ctx.fillStyle = '#aaaaaa';
			ctx.fillText('Click New Game or press Space / Enter to restart', w / 2, h / 2 + 50);
			ctx.restore();
		}
	}
}
