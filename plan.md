<plan>

## Detailed Development Phases

### PH1: Core Infrastructure, Anti-Cheat Guard & Dev Mode (Completed)
* **Project Setup**: Initialized Vite project structure with Vanilla JS and CSS3.
* **State Management (`src/core/state.js`)**: Implemented stage progress tracking using `sessionStorage` and encrypted tokens to prevent manual progression.
* **Router System (`src/core/router.js`)**: Built a robust hash-based SPA router with direct URL guards, route locks, and trap redirects. Added cache-busting versioning (e.g., `?v=13`) for predictable browser updates.
* **History Lock**: Intercepted browser navigation using `window.onpopstate` traps.
* **Dev Mode**: Implemented a global key listener for `Ctrl + Shift + Q` (Dev Mode overlay) to toggle locks and jump stages.
* **Device Guard (`src/core/deviceGuard.js`)**: Enforced a strict desktop-only policy; mobile and small-screen devices are blocked with a terminal-style warning.
* **Audio Engine (`src/core/audio.js`)**: Built a gapless crossfade audio engine for cyberpunk music tracks, incorporating dynamic volume scaling, a pentatonic scale synth beat generator for interaction feedback, and an interaction requirement to bypass browser autoplay policies.
* **Global Welcome**: Added a terminal-style initialization popup on entry, capturing user interaction to start audio, explaining the rules (session memory only), and providing a button to force full-screen entry.
* **Global UI**: Placed "Toggle Music" and "[ ] Fullscreen" buttons across all stages for consistent UX.

### PH2: Stage 1 â€” Trick Login & Crazy Password Game (Completed)
* **Concept**: A fake system login that evolves into a chaotic password formulation challenge.
* **Mechanics**: The user must fulfill increasingly strict and ridiculous password rules (e.g., containing Roman numerals, the current day of the week, numbers summing to exactly 25).
* **Progression**: Stores a clearance token in `sessionStorage` upon successful password creation to unlock Stage 2.

### PH3: Stage 2 â€” Dark Procedural Maze Game (Completed)
* **Concept**: A full-screen canvas-based dark maze.
* **Mechanics**: 
  * Implemented procedural maze generation algorithm ensuring the layout is randomized on every play.
  * Added a darkness mask with a limited visibility radius (spotlight) around the player.
  * Implemented AWSD movement with a twist: a 50% chance for inverted controls (W/S and A/D swapped) per session.
* **Progression**: Stage completion triggers upon reaching the designated maze exit point.

### PH4: Stage 3 â€” System Firewall (Flappy Twist) (Completed)
* **Concept**: A twisted Flappy Bird clone styled as navigating through a system firewall.
* **Mechanics**:
  * The player uses 'W' to flap up to avoid pipes.
  * At score 3: Gravity inverts unexpectedly, requiring 'S' to flap down instead.
  * At score 4: Pipes begin to dynamically move (oscillate) up and down.
  * Includes terminal-style aesthetic touches (hash patterns on pipes).
* **Progression**: Reaching a score of 8 triggers a glitch-win overlay and unlocks Stage 4.

### PH5: Stage 4 â€” The Blind Hacker (Completed)
* **Concept**: A sonar-based audio puzzle where the player must pinpoint a hidden data node while avoiding corrupted signals.
* **Mechanics**:
  * Implemented an AudioContext-based sonar system.
  * One "True Node" emits a clean, high-pitched sine wave; Decoy nodes emit low-pitched corrupted square waves.
  * Ping frequency and volume scale based on cursor distance to the nearest node.
  * Clicking a decoy node (or missing) triggers a trap penalty, ejecting the player to external strange internet sites.
* **Progression**: Clicking the true node within an 80px radius triggers extraction and unlocks Stage 5.

### PH6: Stage 5 â€” Microscopic Data Extraction (Completed)
* **Concept**: A "Where's Waldo" style puzzle using a magnifying glass to find specific data carriers among a swarm of ants.
* **Mechanics**:
  * Renders a swarm of 800 normal ants, 20 decoy ants, and 4 carrier ants in a vast coordinate space.
  * Implemented a scroll-wheel zoom (magnifying lens) attached to the cursor to reveal the ants' contents.
  * Players must find the carriers holding the letters C, O, D, and E.
  * Decoy ants carry random symbols and clicking them triggers an external trap redirect.
  * Implemented dynamic ant AI: ants increase speed and actively flee the cursor as more letters are captured.
* **Progression**: Capturing all 4 letters triggers a Matrix bypass overlay and unlocks Stage 6.

### PH7: Stage 6 â€” The Devil's Playground (Completed)
* **Concept**: A brutally unfair, troll-heavy platformer designed to frustrate and subvert expectations.
* **Mechanics**:
  * Implemented a custom platforming physics engine.
  * Created 10 unique, trap-filled level layouts; 5 are randomly selected per run.
  * Features moving doors, bouncing exits, fake exits that kill the player, invisible solid walls, phantom floors that drop after being touched, falling ceiling spikes, shrinking power-downs, wall chases, and gravity flips.
  * Includes a "Chaos Engine" that randomly decides whether to flip the player's controls and/or visually invert the screen at the start of each level.
  * Tracks and displays player death count.
* **Progression**: Surviving all 5 selected levels unlocks Stage 7.

### PH8: Stage 7 â€” Final Gift (Completed)
* **Concept**: The final reward page revealing the ultimate message.
* **Mechanics**:
  * Features a spotlight mask effect that the player can move with their cursor.
  * Contains an interactive ðŸ’¡ icon that, when clicked, drops the darkness mask and reveals a dynamic, animated gift message.
  * Resolved click-through issues using CSS pointer-events manipulation.

* **UI/UX Polish:** Integrated high-DPI scaling (`window.devicePixelRatio`) for canvas sharpness, fixed template literal bugs, and unified the "Fullscreen" button layout across all stages.
* **Recent Fixes:** Corrected Stage 7 syntax errors, restored the ðŸ’¡ emoji, ensured interactivity through CSS masking, added a terminal-style intro sequence, and fixed global audio beat triggers.
* **Next Steps:** No further development phases are planned. The project is considered complete, pending final full-site stress testing or localized bug fixes if requested.

</current_state>
