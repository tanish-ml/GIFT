# Master Design Document: Stage Aesthetics & Atmosphere

This document provides an exhaustive, highly detailed breakdown of the intended atmosphere, visual aesthetics, and psychological feel of every stage in the project. When designing new UI elements, menus, or HUDs, this document must be referenced to ensure the new additions perfectly match the thematic "vibe" of their respective stages.

---

## The Global Aesthetic Signature
Before diving into individual stages, it's critical to understand the overarching design language of the entire application. 
- **The Core Identity:** This is not a standard web application. It is meant to feel like an illegal, highly unstable, deeply encrypted, 90s-era cyberpunk operating system.
- **The Color Palette:** The UI relies heavily on deep, void-like blacks (`#000`), aggressive neon greens (`#0f0`), stark terminal whites (`#fff`), and blaring warning reds (`#f00`). 
- **The Textures:** Everything is viewed through a simulated CRT monitor. There are subtle scanlines, occasional static pulses, and a slight curvature to the screen. 
- **The UX Philosophy (Hostile Design):** The interface should never feel friendly. It should feel like it is actively resisting the user. Animations should stutter or glitch rather than ease smoothly. Buttons should look like terminal prompts. Nothing should be rounded or "Web 2.0" soft.

---

## Stage 1: The Gatekeeper (Login)
### The Psychological Vibe
**"You are not supposed to be here."** 
The login screen is the player's first impression. It must establish immediately that the user has stumbled upon something hidden and secure. It should feel tense, quiet, and highly restrictive, like sitting in a dark room trying to brute-force a military server.

### Visual Aesthetic & Mechanics
- **Lighting:** Almost entirely pitch black, lit only by the harsh glow of the green terminal text.
- **Background:** A faint, cascading "Matrix" digital rain effect (or static) that implies heavy processing power running in the background.
- **Typography:** Strict, monospaced terminal fonts. A blinking rectangular cursor is mandatory to mimic a command-line interface.
- **Current Elements:** A cryptic boot sequence, a simple input field for the "Access Code", and a raw `[ENTER]` prompt.
- **Future UI Ideas:** 
  - Fake scrolling terminal logs in the background showing "UNAUTHORIZED ACCESS ATTEMPTS".
  - A "Security Level" readout in the corner.
  - A biometric scan graphic (like a fingerprint or retina scan outline) that flashes red when the wrong code is entered.

---

## Stage 2: The Abyss (The Maze)
### The Psychological Vibe
**Claustrophobia, Paranoia, and Survival Horror.**
The player is stripped of their wide field of view. They are trapped in an endless labyrinth where the rules can change instantly. They should feel incredibly vulnerable, constantly second-guessing every turn they take.

### Visual Aesthetic & Mechanics
- **Lighting:** Absolute, oppressive darkness. The only light source is a localized "Fog of War" radial gradient spotlight centered on the player, revealing only the immediate 3-4 tiles around them. 
- **Textures:** The maze walls are drawn as stark, untextured neon green lines. 
- **The Traps (The Bait):** False portals are hidden deep in what look like legitimate hallways. When triggered, the darkness shatters with a jarring, full-screen blast of SVG CRT static and a blaring red "FATAL ERROR" overlay.
- **The Disorientation:** The camera can instantly rotate 180 degrees, flipping the visual rendering completely upside down while maintaining standard keyboard controls, deeply messing with the player's spatial awareness.
- **Future UI Ideas:**
  - A flickering, low-battery indicator for the "Spotlight" (adding tension, even if the battery never actually dies).
  - A glitchy compass that rapidly spins out of control when near a trap.
  - `X/Y` coordinate trackers in the corner that occasionally display corrupt data (e.g., `X: ERR, Y: NULL`).

---

## Stage 3: The Corrupted Arcade (Flappy Bird)
### The Psychological Vibe
**Fast-paced panic and mental whiplash.**
The slow tension of the maze is replaced by high-speed, demanding arcade action. The player is forced to rely on muscle memory, but the system actively sabotages them by altering the physics mid-flight.

### Visual Aesthetic & Mechanics
- **Theme:** A hacked version of a classic arcade game. The pipes are described as "firewalls" that the player (a data packet) must navigate through.
- **Mechanics:** The gravity abruptly inverts at random intervals, completely scrambling the player's rhythm and forcing them to quickly adapt to falling "up."
- **The Death Screen:** When a collision occurs, the game doesn't just say "Game Over"—it throws a hostile, red "SYSTEM FAILURE" alert, offering a fake "Need Help?" button that brutally kicks the player back to Stage 2.
- **Future UI Ideas:**
  - A "Gravity Core" stability meter that flashes violently just before the gravity inverts, giving them a half-second visual warning.
  - Arcade-style pixelated score counters that occasionally glitch and display hex codes instead of numbers.
  - Scrolling hexadecimal memory dumps in the background.

---

## Stage 4: The Blind Hacker (Sonar / Hidden Node)
### The Psychological Vibe
**Sensory deprivation and active listening.**
The game shifts entirely from visual puzzle-solving to audio-based navigation. The player must rely purely on spatial audio cues (pitch, tempo, and volume) to locate an invisible target, forcing a state of intense concentration and deep immersion.

### Visual Aesthetic & Mechanics
- **Visuals:** An almost entirely blank screen. Deep black background with no grid or structural elements. The only visual feedback might be subtle ripple effects or sonar pings when clicking.
- **Mechanics:** The player moves their mouse across the screen. As they get closer to the hidden node, a repeating sonar ping increases in frequency (tempo) and pitch. Clicking randomly without being precise triggers "corrupted signal" traps that visually distract or penalize the player.
- **Future UI Ideas:**
  - A faint, sweeping radar line that only occasionally illuminates the darkness but never reveals the node.
  - An oscilloscope or waveform visualizer in the corner that reacts to the sonar audio.
  - "Decibel" or "Frequency" readouts that change as the mouse moves, giving the illusion of tuning a radio.

---

## Stage 5: The Global Trace (World Map)
### The Psychological Vibe
**High-stakes espionage and triangulation.**
The player feels like a hacker in a movie, tracing an encrypted signal bouncing across global servers. It should feel cinematic, vast, and highly technical.

### Visual Aesthetic & Mechanics
- **Visuals:** A dark, tactical map (likely a satellite view or wireframe globe). Neon borders for countries, overlaid with radar sweeps and target reticles.
- **Colors:** Deep blues, dark greys, and pulsing red markers for targets.
- **Future UI Ideas:**
  - A rapidly updating data stream of Longitude/Latitude coordinates.
  - A rotating radar dish animation tracking the cursor.
  - "Signal Strength" bars that fluctuate based on how close the player is to the correct geographic location.
  - Faux satellite interference (static bars rolling down the screen).

---

## Stage 6: The Core Meltdown (Devil / Boss Fight)
### The Psychological Vibe
**Maximum sensory overload and pure panic.**
This is the final barrier. The system is completely melting down and throwing everything it has at the player to stop them. It should be a test of endurance and focus amidst absolute chaos.

### Visual Aesthetic & Mechanics
- **Colors:** Blood red (`#f00`) and pitch black. The neon green is entirely gone, replaced by the visual language of a critical system failure.
- **Visuals:** Blinding flashes, shaking screens, massive red borders, and aggressive, rapidly spawning popups that obscure vision.
- **Future UI Ideas:**
  - A massive, highly visible "CORE MELTDOWN" countdown timer in the center of the screen ticking down in milliseconds.
  - Warning klaxons (visual alarms spinning in the corners).
  - Fake error dialogue boxes (`System32_deleted.exe`) that the player must rapidly close to see the actual puzzle behind them.

---

## Stage 7: The Payload (Final Message)
### The Psychological Vibe
**Peace, Serenity, and Accomplishment.**
The storm is over. The player has broken through the final firewall and is rewarded with the ultimate prize. The hostility is completely stripped away.

### Visual Aesthetic & Mechanics
- **Background:** An infinite, smoothly panning tiled canvas.
- **Colors:** Warm, calm, and stable. No aggressive reds or jarring neon greens.
- **Animations:** Slow, deliberate, and smooth.
- **The CRT Reminder:** Subtle, infrequent static pulses (every 10 seconds) remind the player that they are still inside the machine, but the machine is finally at peace.
- **Future UI Ideas:**
  - Clean, elegant, readable typography for the final message.
  - A soft, glowing submit/proceed button.
  - Absolutely zero glitch effects, timers, or traps. The UI here should be completely trustworthy.
