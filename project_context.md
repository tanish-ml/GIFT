<project_requirements>

## Project Requirements
* **What to Build:** A highly interactive, 7-stage escape room web app featuring puzzle stages, audio sonar games, microscopic visual challenges, brutal platforming, trap detours, and a final animated gift page.
* **Targeted User:** A single friend (personalized interactive experience, currently themed around "Bhanu").
* **Anti-Cheat Navigation (Strict):**
  * Direct URL skipping is forbidden. The user cannot access `/#/stage-3` without completing stages 1 and 2.
  * Attempting to jump ahead via URL manually resets them to the current valid stage.
  * Safe programmatic routing prevents browser history quirks from interfering with progression.
* **Core Features:**
  1. **Stage State Lock Engine**: Validates progression tokens in `sessionStorage`.
  2. **Canvas / HTML5 Puzzle Mechanics**: Pinhole spotlight (`stage2`, `stage7`), microscopic zooming (`stage5`), audio sonar (`stage4`), procedural generation (`stage2`), custom physics platformer (`stage6`).
  3. **Twisted Mini-Games**: Password Game parody (`stage1`), Flappy Bird with inverted gravity and moving pipes (`stage3`), "Devil's Playground" troll platformer (`stage6`).
  4. **Detour / Trap Routing**: Dead ends, fake doors, and incorrect inputs instantly eject the player to external strange internet sites (e.g., Neal.fun, Pointer Pointer, WindowSwap).
  5. **Chaos Engine**: Controls can randomly reverse (`stage2`), screen can flip and controls can glitch (`stage6`).
  6. **Immersive Audio**: Gapless cyberpunk crossfader, dynamic volume ducking, and generative synth beats upon interaction (`audio.js`).
  7. **Global Overlays**: Initial terminal warning, device restrictions (desktop only), and a global dev mode overlay.

* **Environment:**
  * Node.js v20+
  * Modern Evergreens (Chrome 120+, Firefox 120+, Safari 17+)
  * Local HTTP Dev Server (Vite 5.x)
  * Website is desktop-only. If opened on mobile, the user is locked out by a terminal warning (`deviceGuard.js`).

</project_requirements>

<architecture>

## Architecture
* **Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+ Modules), Vite, Canvas API, Web Audio API.
* **Routing & Guard System:** 
  * Hash-based Single Page Application (SPA) routing (`/#/stage-1`, `/#/stage-2`).
  * Every route transition passes through a `routeGuard()` validator in `src/core/router.js`. Cache-busting queries (`?v=13`) are appended to script imports to bypass browser caching.
  * `sessionStorage.getItem('highestUnlockedStage')` tracks state. If unauthorized, it forces a redirect to the current progress level.
  * History lock: Removed. Replaced with programmatic route navigation (`goToStage`) that ignores browser `popstate` misfires and simply prevents URL skipping without breaking normal back/forward functionality.
* **Folder and File Structure:**
  ```text
  â”œâ”€â”€ index.html            # Main entry point with cache-busting
  â”œâ”€â”€ package.json
  â”œâ”€â”€ project_context.md
  â”œâ”€â”€ plan.md
  â””â”€â”€ src/
      â”œâ”€â”€ main.js           # Entry point, history locks, mobile check, terminal init
      â”œâ”€â”€ core/
      â”‚   â”œâ”€â”€ state.js      # Session token validation & puzzle progress
      â”‚   â”œâ”€â”€ router.js     # Route guard, URL verification & trap router
      â”‚   â”œâ”€â”€ audio.js      # Crossfader, volume control, synth beat generator
      â”‚   â””â”€â”€ deviceGuard.js# Desktop vs Mobile screen verification
      â”œâ”€â”€ styles/
      â”‚   â”œâ”€â”€ main.css      # Global styles, CRT terminal theme, glitch effects
      â”‚   â””â”€â”€ pages.css     # General stage layouts (if applicable)
      â””â”€â”€ stages/
          â”œâ”€â”€ stage1_login/ # The Password Game (Fake Login)
          â”œâ”€â”€ stage2_maze/  # Procedural Dark Maze (Randomized WASD)
          â”œâ”€â”€ stage3_flappy/# System Firewall (Inverted Gravity Flappy Bird)
          â”œâ”€â”€ stage4_twist/ # The Blind Hacker (Audio Sonar Search)
          â”œâ”€â”€ stage5_world/ # Microscopic Data Extraction (Zooming Canvas)
          â”œâ”€â”€ stage6_devil/ # The Devil's Playground (Troll Platformer)
          â””â”€â”€ stage7_gift/  # Final Gift & Animated Reward Page
  ```

</architecture>

<rules>

## Coding Rules & AI Boundaries
1. **Zero External Frameworks:** Pure Vanilla JS ES modules only. No React, Vue, or heavy UI libraries. Canvas API is heavily utilized for rendering.
2. **Anti-Cheat Navigation Enforcement:**
   * Direct URL skipping is strictly blocked via `src/core/router.js`.
   * Uncleared direct URL attempts force a silent redirection back to the highest unlocked stage.
   * Programmatic hash manipulation is safely wrapped to prevent rogue popstate events.
3. **Dev Mode Keyboard Shortcut:**
   * Listening for `Ctrl + Shift + Q` globally across all stages.
   * Pressing `Ctrl + Shift + Q` toggles a Dev Overlay allowing direct stage switching, skipping password rules, and bypassing route locks for testing.
4. **Self-Contained Stage Modules:** Each stage file inside `src/stages/*/index.js` must export `init()` and `destroy()` functions to clear event listeners, Web Audio contexts, and animation loops (`requestAnimationFrame`) upon navigation.
5. **High-DPI Support:** All Canvas contexts must scale via `window.devicePixelRatio` to prevent blurriness on modern displays.
6. **Obfuscation:** Do not write answers or clear keys in plain text comments. Use standard encoding (`btoa()`) or hash checks where applicable.
7. **String Literals:** Avoid unescaped backslashes (`\`) inside JavaScript template literals to prevent syntax execution errors.

</rules>
