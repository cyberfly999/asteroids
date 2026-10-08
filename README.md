# 🚀 Asteroids — Modern HTML5 Canvas Arcade Game

<p align="center">
  <img src="https://img.shields.io/badge/Language-JavaScript%20(ES6+)-f7df1e?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Platform-HTML5%20Canvas-e34f26?logo=html5&logoColor=white" alt="HTML5 Canvas" />
  <img src="https://img.shields.io/badge/Style-CSS3-1572b6?logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Dependencies-Zero-brightgreen" alt="Dependencies: Zero" />
  <img src="https://img.shields.io/badge/Mobile-Touch%20Controls%20Supported-blue" alt="Touch Controls" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License: MIT" />
</p>

A fast, responsive, and dependency-free modern web implementation of the classic 1979 arcade vector game **Asteroids**. Built with pure vanilla JavaScript (ES Modules), HTML5 Canvas 2D, and CSS3, featuring smooth Newtonian physics, procedural asteroid geometry, particle explosions, responsive touch controls for mobile screens, high-DPI (Retina) rendering, and local high score persistence.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🎮 Controls](#-controls)
  - [Desktop Keyboard](#desktop-keyboard)
  - [Mobile & Touch Devices](#mobile--touch-devices)
- [🎯 Gameplay & Mechanics](#-gameplay--mechanics)
  - [Asteroid Splitting & Tiers](#asteroid-splitting--tiers)
  - [Wave Progression & Scaling](#wave-progression--scaling)
  - [Scoring System](#scoring-system)
  - [Spawn Protection](#spawn-protection)
- [🏗️ Project Architecture](#️-project-architecture)
  - [Directory Structure](#directory-structure)
  - [Core Classes & Modules](#core-classes--modules)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Locally](#running-locally)
- [⚙️ Technical Highlights](#️-technical-highlights)
- [🎨 Customization](#-customization)
- [📄 License](#-license)

---

## ✨ Features

- 🛸 **Authentic Vector Physics**: Realistic spaceship inertia, rotational steering, forward thrust acceleration, active reverse braking/dampening, and simulated space friction.
- 🪨 **Procedural Asteroids**: Every asteroid features procedurally generated jagged polygon geometry, randomized rotational velocity, and multi-tier splitting mechanics.
- 💥 **Explosive Particle FX**: Particle burst effects on asteroid destruction, bullet impacts, and ship explosions.
- 🌌 **Screen-Wrapping Toroidal Space**: Fluid screen-wrapping for both the player ship and drifting asteroids, with outer boundary padding to eliminate visual pop-in.
- 🌊 **Progressive Wave Difficulty**: Each successive wave escalates asteroid count and drift velocity, rewarding players with increasing wave completion bonuses.
- 📱 **Mobile & Touch Ready**: Automatically displays responsive on-screen virtual controls (D-Pad rotate, thrust, fire) on mobile or touch-enabled displays.
- 🖥️ **High-DPI / Retina Crispness**: Automatically adapts canvas buffer dimensions using `window.devicePixelRatio` for razor-sharp vector graphics on high-resolution displays.
- 💾 **Persistent High Scores**: Automatically records and retrieves player high scores across sessions using `localStorage` with fail-safe error handling.
- ⚡ **Zero Dependencies**: Pure vanilla JavaScript and standard Web APIs—no external libraries, bundlers, or frameworks required.

---

## 🎮 Controls

### Desktop Keyboard

| Action | Primary Key | Secondary / Alternative |
| :--- | :--- | :--- |
| **Rotate Left** | <kbd>← Left Arrow</kbd> | <kbd>A</kbd> |
| **Rotate Right** | <kbd>→ Right Arrow</kbd> | <kbd>D</kbd> |
| **Forward Thrust** | <kbd>↑ Up Arrow</kbd> | <kbd>W</kbd> |
| **Brake / Reverse Drag** | <kbd>↓ Down Arrow</kbd> | <kbd>S</kbd> |
| **Fire Blaster** | <kbd>Space</kbd> | <kbd>J</kbd> |
| **Pause / Resume** | <kbd>P</kbd> | Pause UI Button |
| **Restart Game** *(Game Over)* | <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>R</kbd> | New Game UI Button |

### Mobile & Touch Devices

When accessed on a touch device or screen width under `900px`, on-screen touch overlay controls activate automatically:

```
 ┌─────────────────────────────────────────────────────────────┐
 │ [Score: 1250] [Wave: 2] [Lives: 3] [High: 3400]             │
 │                                                             │
 │                                                             │
 │                          🚀                                 │
 │                                                             │
 │                                                             │
 │   (◀) (▶)                                         (▲)  (●)  │
 │  Left Right                                     Thrust Fire │
 └─────────────────────────────────────────────────────────────┘
```

- **Left D-Pad (◀ / ▶)**: Steer ship counter-clockwise or clockwise.
- **Thrust Button (▲)**: Fire forward engines with visual thruster flare.
- **Fire Button (●)**: Rapid blaster cannon (throttled to 180ms cooldown).

---

## 🎯 Gameplay & Mechanics

### Asteroid Splitting & Tiers

Asteroids are divided into three distinct tiers:

1. **Large Asteroid (Tier 2)**: Spawns at the beginning of each wave with a radius of `40–70px`. When hit by a bullet, it splits into **2 Medium Asteroids** and produces particle debris.
2. **Medium Asteroid (Tier 1)**: Radius scaled to `50%` of parent. When destroyed, splits into **2 Small Asteroids**.
3. **Small Asteroid (Tier 0)**: Smallest target with the highest point bounty. When struck, it vaporizes completely into particle bursts without further splitting.

### Wave Progression & Scaling

- **Asteroid Count**: `Math.min(12, 4 + Wave * 2)` large asteroids per wave.
- **Velocity Scaling**: Asteroid drift velocity increases by `+15%` per completed wave (`1 + (Wave - 1) * 0.15`).
- **Safe Zone Spawning**: Newly spawned asteroids are prevented from generating within the player ship's immediate radius (`safeRadius = 150px` or `35%` of viewport) to prevent instant unavoidable collisions.

### Scoring System

| Target / Event | Points Awarded | Behavior |
| :--- | :---: | :--- |
| **Large Asteroid** *(Level 2)* | **20 pts** | Splits into 2 Medium Asteroids |
| **Medium Asteroid** *(Level 1)* | **50 pts** | Splits into 2 Small Asteroids |
| **Small Asteroid** *(Level 0)* | **100 pts** | Destroyed completely |
| **Wave Clear Bonus** | **1,000 × Wave** | Awarded when all asteroids on screen are cleared |

### Spawn Protection

- Upon game start or respawning after a collision, the ship is granted **2.0 seconds of invulnerability**.
- During invulnerability, the ship wireframe blinks at high frequency, and asteroid collisions are ignored.

---

## 🏗️ Project Architecture

### Directory Structure

```text
Asteroids/
├── index.html        # Main HTML layout, HUD overlay, and mobile touch buttons
├── style.css         # Fullscreen styling, HUD typography, and responsive media queries
├── src/
│   ├── main.js       # Application bootstrapper and entry point
│   └── asteroids.js  # Complete game engine, entity classes, physics, and rendering
└── README.md         # Project documentation and guide
```

### Core Classes & Modules

The entire game logic is structured into clean, modular ES6 classes inside `src/asteroids.js`:

| Class / Module | Responsibility | Key Attributes & Methods |
| :--- | :--- | :--- |
| `Ship` | Manages player ship position, velocity vectors, rotation, drag decay, invulnerability blinking, boundary wrapping, and wireframe rendering. | `pos`, `vel`, `angle`, `thrusting`, `invulnerable`, `update()`, `wrap()`, `draw()` |
| `Asteroid` | Generates randomized jagged polygon vertices, simulates rotational drift and velocity, handles screen wrap, and spawns child fragments. | `pos`, `vel`, `level`, `points`, `rotSpeed`, `update()`, `split()`, `draw()` |
| `Bullet` | Fast-moving laser projectiles launched from ship nose with a 2-second lifetime limit. | `pos`, `vel`, `life`, `radius`, `update()`, `draw()` |
| `Particle` | Transient visual debris created during ship explosions and asteroid impacts. | `pos`, `vel`, `life`, `update()`, `draw()` |
| `AsteroidsGame` | Main game orchestrator: handles canvas resize/Retina scaling, requestAnimationFrame loop, input listening, collision detection, wave progression, and HUD synchronization. | `score`, `wave`, `lives`, `high`, `loop()`, `update()`, `draw()`, `reset()`, `destroy()` |

---

## 🚀 Getting Started

### Prerequisites

All you need is any modern web browser that supports ES6 Modules and HTML5 Canvas (Chrome, Safari, Firefox, Edge, etc.).

### Running Locally

Because the project utilizes native ES Modules (`import`/`export`), `index.html` must be served via a local HTTP server rather than opened directly as a `file://` URL (due to browser CORS restrictions on local module files).

Choose any of the quick server options below from your terminal inside the project directory:

#### Option 1: Python 3 (Built-in)
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

#### Option 2: Node.js (`npx serve` or `npx live-server`)
```bash
# Using npx serve
npx serve .

# Or using live-server for auto-reload
npx live-server
```

#### Option 3: PHP Built-in Server
```bash
php -S localhost:8000
```

#### Option 4: PhpStorm / WebStorm / VS Code
- **PhpStorm / WebStorm**: Right-click `index.html` -> **Open in Browser**.
- **VS Code**: Use the *Live Server* extension (`Go Live`).

---

## ⚙️ Technical Highlights

- **Frame-Rate Independent Physics**: Velocity decay and rotation speeds are computed using delta time ($\Delta t$) clamped to a maximum of $33\text{ ms}$ ($\sim 30\text{ FPS}$) to avoid physics instability during frame drops or tab switching:
  ```js
  const dt = Math.min(0.033, (ts - this._last) / 1000);
  this.vel.x *= Math.pow(0.99, dt * 60);
  ```
- **High-DPI / Retina Support**: Canvas resolution dynamically updates to match the device pixel ratio, preventing blurry vector strokes on high-density screens:
  ```js
  const dpr = window.devicePixelRatio || 1;
  this.canvas.width = w * dpr;
  this.canvas.height = h * dpr;
  this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ```
- **Deterministic Starfield Optimization**: Background stars are generated into integer coordinate caches upon resize, avoiding per-frame pseudo-random calculations or subpixel rendering overhead.
- **Fail-Safe Persistence**: Safe `localStorage` getter and setter methods wrapped in `try...catch` blocks to support private browsing modes and sandboxed iframe environments.
- **Memory & Resource Cleanups**: Complete `destroy()` method for removing event listeners and canceling `requestAnimationFrame` when embedding or tearing down the component.

---

## 🎨 Customization

You can easily adjust game parameters directly in `src/asteroids.js`:

- **Starting Lives**: Edit `this.lives = 3` in `AsteroidsGame.constructor` and `reset()`.
- **Ship Acceleration**: Adjust `300 * dt` in `Ship.update()`.
- **Weapon Fire Rate**: Adjust the `180` ms cooldown check in `AsteroidsGame.update()`.
- **Asteroid Speeds**: Modify `const speed = 80 * speedMultiplier` in `Asteroid.constructor`.
- **Starfield Density**: Change the star count loop (`80`) in `AsteroidsGame.generateStars()`.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE). Feel free to use, modify, and distribute as you wish.
