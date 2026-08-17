import { unlockStage, isDevModeActive } from '../../core/state.js';
import { getGlobalVolume, setGlobalVolume, toggleMusic, forceTrack } from '../../core/audio.js';
import { applyCyberpunkDecoder } from '../../core/ui.js';

const TILE_SIZE = 40;
const CANVAS_W = 800; // 20 tiles (wider)
const CANVAS_H = 400; // 10 tiles (shorter)

const LEVEL_MAPS = [
    // 1: First Impressions (Moving Door + Spikes)
    [
        "____________________",
        "      C             ",
        "____________________",
        "____________________",
        "____________________",
        "S      ZYYYXM       ",
        "WWWWW  WWWWWW  W    ",
        "       WWWWWWWWW    ",
        "                    ",
        "                    ",
    ],
    // 2: Trust Issues (Invisible Bonk)
    [
        "____________________",
        "____________________",
        "____________________",
        "        O           ",
        "        O           ",
        "____________________",
        "S  WWWW    E        ",
        "W  WWWW O           ",
        "   UUU              ",
        "                    ",
    ],
    // 3: Look Up (Ceiling Drop)
    [
        "____________________",
        "        C           ",
        "        W           ",
        "                    ",
        "                    ",
        "                    ",
        "S      T    E       ",
        "WW     WWQWWW       ",
        "   XXX              ",
        "                    ",
    ],
    // 4: Upside Down (Gravity Flip)
    [
        "WWWWWWWWWWWWWWWWWWWW",
        "             E      ",
        "             W      ",
        "                    ",
        "                    ",
        "                    ",
        "S VVV     G         ",
        "WWWWWWWWWW    WWWWWW",
        "                    ",
        "                    ",
    ],
    // 5: The Magic Platforms
    [
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "                    ",
        "S                  E",
        "WAAA                ",
        "                    ",
        "                    ",
        "                    ",
    ],
    // 6: The Rhythm Trick
    [
        "                    ",
        "                   E",
        "                    ",
        "                  K ",
        "               R    ",
        "            N       ",
        "         N          ",
        "      N             ",
        "S  N                ",
        "N                   ",
    ],
    // 7: The Leap of Faith (Fake Gap)
    [
        "____________________",
        "____________________",
        "____________________",
        "____________________",
        "____________________",
        "S T              E  ",
        "WWIIIIIIIIIIIIIJJW  ",
        "                    ",
        "                    ",
        "                    ",
    ],
    // 8: The Compression Chamber (Wall Chase)
    [
        "                   E",
        "               WWWWW",
        "                    ",
        "L        WWWWW      ",
        "                    ",
        "   WWWWW            ",
        "                    ",
        "        WWWWW       ",
        "S                   ",
        "WWWWWWWWWWWWWWWWWWWW",
    ],
    // 9: Antman (Shrink + Phantom Tunnel)
    [
        "____________________",
        "____________________",
        "____________________",
        "____________________",
        "_____________WWWWWWW",
        "S     H            E",
        "WWWWWWWWWWW  PPPPPPP",
        "                    ",
        "             WWWWWWW",
        "             WWWWWWW",
    ],
    // 10: The Grand Scheme
    [
        "WWWWWWWWWWWWWWWWWWWW",
        " E                  ",
        " WW                 ",
        "             G      ",
        "                    ",
        "                    ",
        "S  WPP    T      M  ",
        "W  WWW    WW    WW  ",
        "                    ",
        "                    ",
    ]
];

let canvas, ctx;
let animationId;
let boundKeydown, boundKeyup, boundResize;

let playlist = [];
let currentPlaylistIndex = 0;
let deaths = 0;
let gamePaused = false;

let controlsFlipped = false;
let screenFlipped = false;

// Particle system
let particles = [];
for (let i = 0; i < 60; i++) {
    particles.push({
        x: Math.random() * CANVAS_W,
        y: Math.random() * CANVAS_H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 1.0) * 1.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1
    });
}

let keys = { a: false, d: false, w: false, space: false };

let player = {
    x: 0, y: 0,
    w: 24, h: 32,
    vx: 0, vy: 0,
    speed: 5,
    jumpPower: -9,
    gravity: 0.4,
    terminalVel: 12,
    grounded: false,
    facingLeft: false,
    inverted: false,
    trail: []
};

let tiles = [];
let entities = [];
let triggers = {};
let wallChaseX = -100;

function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function init() {
    forceTrack('/music/ob-lix-the-encounter-mystery-amp-drama-background-music-109380.mp3');
    setGlobalVolume(0.3);
    const app = document.getElementById('app');
    const devMode = isDevModeActive();
    
    app.innerHTML = `
        <div class="stage6-devil-container">
            <div class="devil-hud">
                <div class="devil-stat" id="hud-level">LEVEL: 1/5</div>
                <div class="devil-stat" id="hud-deaths">DEATHS: 0</div>
            </div>
            
            <button class="devil-btn-skip" id="btn-skip">Give Up</button>
            ${devMode ? `
                <div style="position:absolute; top:70px; right:20px; z-index:100; display:flex; gap:10px;">
                    <select id="dev-layout-select" style="padding:10px; background:#000; color:#0f0; border:2px solid #0f0; font-family:monospace; font-weight:bold; cursor:pointer; border-radius:5px; outline:none;">
                        <option value="" disabled selected>Layout</option>
                        <option value="0">1: Moving Door</option>
                        <option value="1">2: Invisible Bonk</option>
                        <option value="2">3: Ceiling Drop</option>
                        <option value="3">4: Gravity Flip</option>
                        <option value="4">5: Invisible Maze</option>
                        <option value="5">6: Bouncing Door</option>
                        <option value="6">7: Fake Gap</option>
                        <option value="7">8: Wall Chase</option>
                        <option value="8">9: Antman</option>
                        <option value="9">10: Grand Scheme</option>
                    </select>
                    <button id="btn-dev-skip" style="padding:10px 15px; background:#f0f; color:#fff; font-family:monospace; font-weight:bold; cursor:pointer; border:2px solid #fff; border-radius:5px;">SKIP (DEV)</button>
                </div>
            ` : ''}
            <div class="devil-glitch-banner" id="glitch-banner">CONTROLS GLITCHED</div>
            
            <canvas id="devil-canvas" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
            
            <div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center; pointer-events: auto;">
                <h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 6 INSTRUCTIONS</h2>
                <p style="font-size: 18px; margin-bottom: 10px; max-width: 600px;">Reach the exit door. Expect the unexpected. 5 levels stand between you and the end.</p>
                <p style="font-size: 18px; margin-bottom: 10px; max-width: 600px;"> Use AWSD to move. But your controls or map can flip if you die.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p>
                <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="vol-slider-6" style="font-size: 14px;">Music Volume</label>
                    <input type="range" id="vol-slider-6" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="btn-toggle-music-6" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button>
                        <button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    canvas = document.getElementById('devil-canvas');
    ctx = canvas.getContext('2d');

    // High DPI scaling for crisp graphics
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    ctx.scale(dpr, dpr);

    boundResize = () => {
        const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H) * 0.9;
        canvas.style.transform = `scale(${scale})`;
    };
    window.addEventListener('resize', boundResize);
    boundResize();

    document.getElementById('btn-skip').addEventListener('click', () => {
        window.location.href = 'https://floatingqrcode.com/';
    });

    if (devMode) {
        document.getElementById('btn-dev-skip').addEventListener('click', () => {
            winLevel();
        });
        const layoutSelect = document.getElementById('dev-layout-select');
        if (layoutSelect) {
            layoutSelect.addEventListener('change', (e) => {
                const layoutIdx = parseInt(e.target.value);
                if (!isNaN(layoutIdx)) {
                    playlist[currentPlaylistIndex] = layoutIdx;
                    deaths = 0;
                    loadLevel();
                    layoutSelect.blur();
                }
            });
        }
    }

    const instrTitle = document.querySelector('#instruction-popup h2');
    if (instrTitle) applyCyberpunkDecoder(instrTitle);

    boundKeydown = (e) => {
        if (e.key.toLowerCase() === 'h') {
            gamePaused = !gamePaused;
            document.getElementById('instruction-popup').style.display = gamePaused ? 'flex' : 'none';
            if (gamePaused) {
                const slider = document.getElementById('vol-slider-6');
                if (slider) slider.value = getGlobalVolume();
            }
            return;
        }

        if (gamePaused) return;

        let key = e.key.toLowerCase();
        if (key === 'arrowleft') key = 'a';
        if (key === 'arrowright') key = 'd';
        if (key === 'arrowup' || key === ' ') key = 'w';

        if (controlsFlipped) {
            if (key === 'a') key = 'd';
            else if (key === 'd') key = 'a';
        }

        if (keys.hasOwnProperty(key)) keys[key] = true;
    };

    boundKeyup = (e) => {
        let key = e.key.toLowerCase();
        if (key === 'arrowleft') key = 'a';
        if (key === 'arrowright') key = 'd';
        if (key === 'arrowup' || key === ' ') key = 'w';

        if (controlsFlipped) {
            if (key === 'a') key = 'd';
            else if (key === 'd') key = 'a';
        }

        if (keys.hasOwnProperty(key)) keys[key] = false;
    };

    document.addEventListener('keydown', boundKeydown);
    document.addEventListener('keyup', boundKeyup);

    const volSlider = document.getElementById('vol-slider-6');
    if (volSlider) {
        volSlider.addEventListener('input', (ev) => {
            setGlobalVolume(parseFloat(ev.target.value));
        });
    }

    const btnToggle = document.getElementById('btn-toggle-music-6');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleMusic();
        });
    }

    // Setup Playlist
    let mapIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    playlist = shuffle(mapIndices).slice(0, 5);
    currentPlaylistIndex = 0;
    deaths = 0;
    gamePaused = false;

    loadLevel();
    loop();
}

function loadLevel() {
    if (currentPlaylistIndex >= 5) {
        unlockStage(7);
        window.transitionToStage(7);
        return;
    }

    const layoutIndex = playlist[currentPlaylistIndex];
    const devMode = isDevModeActive();

    let levelText = `LEVEL: ${currentPlaylistIndex + 1}/5`;
    if (devMode) levelText += ` (Layout ${layoutIndex + 1}/10)`;

    document.getElementById('hud-level').innerText = levelText;
    document.getElementById('hud-deaths').innerText = `DEATHS: ${deaths}`;

    // Chaos Engine
    if (devMode) {
        controlsFlipped = false;
        screenFlipped = false;
    } else {
        controlsFlipped = Math.random() > 0.5;
        screenFlipped = Math.random() > 0.5;
    }

    const banner = document.getElementById('glitch-banner');
    if (controlsFlipped) {
        banner.classList.remove('devil-glitch-active');
        void banner.offsetWidth; // trigger reflow
        banner.classList.add('devil-glitch-active');
    } else {
        banner.classList.remove('devil-glitch-active');
    }

    // Parse Level Map
    tiles = [];
    entities = [];
    triggers = {
        doorsMoved: false,
        spikesDropped: false,
        bridgeVisible: false,
        wallChaseActive: false,
        gravityFlipped: false,
        shiftingSpikes: []
    };
    wallChaseX = -100;
    
    player.vx = 0;
    player.vy = 0;
    player.inverted = false;
    player.w = 24;
    player.h = 32;
    keys = { a: false, d: false, w: false };

    const map = LEVEL_MAPS[playlist[currentPlaylistIndex]];
    
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 20; c++) {
            const char = map[r][c];
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            if (char === 'S') {
                player.x = x + (TILE_SIZE - player.w) / 2;
                player.y = y + (TILE_SIZE - player.h);
            } else if (char === 'E') {
                entities.push({ type: 'exit', x, y, w: TILE_SIZE, h: TILE_SIZE, origX: x, origY: y });
            } else if (char === 'M') {
                entities.push({ type: 'moving_exit', x, y, w: TILE_SIZE, h: TILE_SIZE, targetX: x + TILE_SIZE*3 });
            } else if (char === 'B') {
                entities.push({ type: 'bouncing_exit', x, y, w: TILE_SIZE, h: TILE_SIZE, origY: y });
            } else if (char === 'D') {
                entities.push({ type: 'fake_exit', x, y, w: TILE_SIZE, h: TILE_SIZE, revealed: false });
            } else if (char === 'W') {
                tiles.push({ type: 'wall', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: true });
            } else if (char === 'P') {
                tiles.push({ type: 'phantom', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: true, triggered: false, timer: 0 });
            } else if (char === 'T') {
                entities.push({ type: 'trigger', x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === 'Z') {
                entities.push({ type: 'trigger', x, y, w: TILE_SIZE, h: TILE_SIZE });
                entities.push({ type: 'harmless_spike', x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === 'X') {
                entities.push({ type: 'spike', x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === 'Y') {
                entities.push({ type: 'harmless_spike', x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === 'V') {
                let s = { type: 'shift_spike', x, y, w: TILE_SIZE, h: TILE_SIZE, origX: x, shifted: false };
                entities.push(s);
                triggers.shiftingSpikes.push(s);
            } else if (char === 'U') {
                entities.push({ type: 'shooting_spike', x, y, w: TILE_SIZE, h: TILE_SIZE, origY: y, timer: 0 });
            } else if (char === 'Q') {
                tiles.push({ type: 'instant_phantom', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: true, triggered: false });
            } else if (char === 'C') {
                entities.push({ type: 'ceiling_spike', x, y, w: TILE_SIZE, h: TILE_SIZE, active: false });
            } else if (char === 'I') {
                tiles.push({ type: 'invisible', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: false });
            } else if (char === 'J') {
                tiles.push({ type: 'invisible_fake', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: false });
            } else if (char === 'O') {
                tiles.push({ type: 'invisible_solid', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: true, revealed: false });
            } else if (char === 'H') {
                entities.push({ type: 'shrink', x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === 'G') {
                entities.push({ type: 'gravity', x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === 'L') {
                triggers.wallChaseActive = true;
            } else if (char === 'A') {
                let block = { type: 'magic_platform', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: true, dropped: false };
                tiles.push(block);
                triggers.magicPlatforms = triggers.magicPlatforms || [];
                triggers.magicPlatforms.push(block);
                triggers.magicPlatformActive = false;
                triggers.magicPlatformTimer = 0;
            } else if (char === 'N' || char === 'R' || char === 'K') {
                let block = { type: 'seq_platform', subType: char, x, y, w: TILE_SIZE, h: TILE_SIZE, solid: false, visible: false, dropped: false };
                tiles.push(block);
                triggers.seqBlocks = triggers.seqBlocks || [];
                triggers.seqBlocks.push(block);
            }
        }
    }

    if (triggers.seqBlocks) {
        triggers.seqBlocks.sort((a, b) => a.x - b.x);
        for (let i = 0; i < triggers.seqBlocks.length; i++) {
            triggers.seqBlocks[i].sequenceIndex = i;
        }
        triggers.seqTimer = 0;
    }
}

function die() {
    deaths++;
    document.getElementById('hud-deaths').innerText = `DEATHS: ${deaths}`;
    loadLevel(); // Instant Respawn
}

function winLevel() {
    currentPlaylistIndex++;
    loadLevel();
}

function checkCollision(r1, r2) {
    if (r2.type === 'magic_platform') {
        const overlapX = Math.min(r1.x + r1.w, r2.x + r2.w) - Math.max(r1.x, r2.x);
        if (overlapX < r1.w * 0.5) return false;
    }
    return (
        r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y
    );
}

function getSolidTiles() {
    return tiles.filter(t => t.solid);
}

function update() {
    if (gamePaused) return;

    // Update Particles
    for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
            p.y = CANVAS_H + 10;
            p.x = Math.random() * CANVAS_W;
        }
    }

    // Trail
    player.trail.push({ x: player.x, y: player.y, w: player.w, h: player.h });
    if (player.trail.length > 8) player.trail.shift();

    // Movement
    if (keys.a) {
        player.vx = -player.speed;
        player.facingLeft = true;
    } else if (keys.d) {
        player.vx = player.speed;
        player.facingLeft = false;
    } else {
        player.vx = 0;
    }

    if (keys.w && player.grounded) {
        player.vy = player.inverted ? -player.jumpPower : player.jumpPower;
        player.grounded = false;
        
        // Troll: Bouncing Door
        entities.filter(e => e.type === 'bouncing_exit').forEach(e => {
            e.vy = -6;
        });
    }

    // Gravity
    if (player.inverted) {
        player.vy -= player.gravity;
        if (player.vy < -player.terminalVel) player.vy = -player.terminalVel;
    } else {
        player.vy += player.gravity;
        if (player.vy > player.terminalVel) player.vy = player.terminalVel;
    }

    // X Collision
    player.x += player.vx;
    for (let t of getSolidTiles()) {
        if (checkCollision(player, t)) {
            if (t.type === 'invisible_solid') t.revealed = true;
            if (player.vx > 0) player.x = t.x - player.w;
            else if (player.vx < 0) player.x = t.x + t.w;
        }
    }

    // Bounds Check for Walls (X-axis) - Don't kill player, just block them
    if (player.x < 0) player.x = 0;
    if (player.x > CANVAS_W - player.w) player.x = CANVAS_W - player.w;

    // Y Collision
    player.y += player.vy;
    player.grounded = false;
    for (let t of getSolidTiles()) {
        if (checkCollision(player, t)) {
            if (t.type === 'invisible_solid') t.revealed = true;
            if (player.vy > 0) {
                player.y = t.y - player.h;
                player.grounded = !player.inverted;
                player.vy = 0;
                if ((t.type === 'phantom' || t.type === 'instant_phantom') && !t.triggered) t.triggered = true;
            } else if (player.vy < 0) {
                player.y = t.y + t.h;
                player.grounded = player.inverted;
                player.vy = 0;
                if ((t.type === 'phantom' || t.type === 'instant_phantom') && player.inverted && !t.triggered) t.triggered = true;
            }
        }
    }

    // Bounds Check for Pits (Y-axis) - Falling out of bounds still kills
    if (player.y > CANVAS_H + 50) {
        die();
        return;
    }

    // Troll Mechanisms Updates
    
    // Instant Phantom Floors
    tiles.forEach(t => {
        if (t.type === 'instant_phantom' && t.triggered) {
            t.y += 15;
            t.solid = false;
        }
    });

    // Phantom Floors
    tiles.forEach(t => {
        if (t.type === 'phantom' && t.triggered) {
            t.timer += 16;
            if (t.timer > 100) {
                t.y += 5; // fall
                t.solid = false;
            }
        }
    });

    // Bouncing Doors
    entities.forEach(e => {
        if (e.type === 'bouncing_exit') {
            if (e.vy !== undefined) {
                e.y += e.vy;
                e.vy += 0.5;
                if (e.y > e.origY) {
                    e.y = e.origY;
                    e.vy = undefined;
                }
            }
        }
    });

    // Shooting Spikes
    entities.forEach(e => {
        if (e.type === 'shooting_spike') {
            e.timer++;
            const cycle = e.timer % 240;
            if (cycle < 60) {
                e.y = e.origY;
            } else if (cycle < 75) {
                e.y -= (TILE_SIZE * 2.2) / 15;
            } else if (cycle < 150) {
                // hold
            } else {
                e.y += (TILE_SIZE * 2.2) / 90;
                if (e.y > e.origY) e.y = e.origY;
            }
        }
    });

    // Shifting Spikes Logic
    if (triggers.shiftingSpikes && triggers.shiftingSpikes.length > 0) {
        let grp = triggers.shiftingSpikes;
        let firstSpike = grp[0];
        if (!firstSpike.shifted && player.x > firstSpike.x + 10 && !player.grounded) {
            grp.forEach(s => s.shifted = true);
        }
        
        grp.forEach(s => {
            if (s.shifted && s.x < s.origX + TILE_SIZE * 2) {
                s.x += 20; // slide super fast!
                if (s.x > s.origX + TILE_SIZE * 2) s.x = s.origX + TILE_SIZE * 2;
            }
        });
    }

    // Magic Platforms
    if (triggers.magicPlatforms) {
        if (!triggers.magicPlatformActive) {
            let standingOn = false;
            for (let b of triggers.magicPlatforms) {
                if (player.y + player.h === b.y) {
                    const overlapX = Math.min(player.x + player.w, b.x + b.w) - Math.max(player.x, b.x);
                    if (overlapX >= player.w * 0.5) {
                        standingOn = true;
                    }
                }
            }
            if (standingOn) {
                triggers.magicPlatformActive = true;
            }
        }

        if (triggers.magicPlatformActive) {
            triggers.magicPlatformTimer += 16;
            
            let speed = triggers.magicPlatforms[1].x >= 18 * TILE_SIZE ? 0 : 1.5;
            
            for (let b of triggers.magicPlatforms) {
                b.x += speed;
            }
            
            let playerOnAny = false;
            for (let b of triggers.magicPlatforms) {
                if (!b.dropped && player.y + player.h === b.y) {
                    const overlapX = Math.min(player.x + player.w, b.x + b.w) - Math.max(player.x, b.x);
                    if (overlapX >= player.w * 0.5) {
                        playerOnAny = true;
                    }
                }
            }
            if (playerOnAny) {
                player.x += speed;
                if (player.x > CANVAS_W - player.w) player.x = CANVAS_W - player.w;
            }

            if (triggers.magicPlatformTimer > 1500 && !triggers.magicPlatforms[0].dropped) {
                triggers.magicPlatforms[0].dropped = true;
                triggers.magicPlatforms[0].solid = false;
            }
            if (triggers.magicPlatforms[0].dropped) {
                triggers.magicPlatforms[0].y += 8;
            }

            if (triggers.magicPlatformTimer > 2500 && !triggers.magicPlatforms[2].dropped) {
                triggers.magicPlatforms[2].dropped = true;
                triggers.magicPlatforms[2].solid = false;
            }
            if (triggers.magicPlatforms[2].dropped) {
                triggers.magicPlatforms[2].y += 8;
            }
        }
    }

    // Sequence Platforms
    if (triggers.seqBlocks) {
        triggers.seqTimer += 16;
        let t = triggers.seqTimer;
        
        for (let i = 0; i < triggers.seqBlocks.length; i++) {
            let b = triggers.seqBlocks[i];
            let appearTime = i * 1000; // 1 second between block appearances
            
            if (b.subType === 'N') {
                let dropTime = appearTime + 1500;
                if (t > appearTime && t < dropTime) {
                    b.visible = true;
                    b.solid = true;
                } else if (t >= dropTime && !b.dropped) {
                    b.dropped = true;
                    b.solid = false;
                }
            } else if (b.subType === 'R') {
                if (t > appearTime) {
                    b.visible = true;
                    b.solid = true;
                }
            } else if (b.subType === 'K') {
                if (t > appearTime && t < appearTime + 500) {
                    b.visible = true;
                    b.solid = true;
                } else if (t >= appearTime + 500 && t < appearTime + 1500) {
                    b.visible = false;
                    b.solid = false;
                } else if (t >= appearTime + 1500) {
                    b.visible = true;
                    b.solid = true;
                }
            }

            if (b.dropped) {
                b.y += 8;
            }
        }
    }

    // Wall Chase
    if (triggers.wallChaseActive) {
        wallChaseX += 0.7;
        if (player.x < wallChaseX) {
            die();
            return;
        }
    }

    // Entity Collisions
    for (let e of entities) {
        if (checkCollision(player, e)) {
            if (e.type === 'exit' || e.type === 'moving_exit' || e.type === 'bouncing_exit' || e.type === 'fake_exit') {
                if (e.type === 'fake_exit' && e.revealed) {
                    die(); // The fake door spikes you
                    return;
                } else if (e.type === 'fake_exit') {
                    // reveal it just before death if you want, but AABB handles this instantly
                } else {
                    winLevel();
                    return;
                }
            } else if (e.type === 'spike' || e.type === 'shooting_spike' || e.type === 'shift_spike' || e.type === 'ceiling_spike') {
                die();
                return;
            } else if (e.type === 'trigger') {
                triggers.doorsMoved = true;
                triggers.spikesDropped = true;
                triggers.bridgeVisible = true;
            } else if (e.type === 'shrink') {
                player.w = 14;
                player.h = 18;
            } else if (e.type === 'gravity' && !triggers.gravityFlipped) {
                triggers.gravityFlipped = true;
                player.inverted = true;
                player.vy = 0;
            } else if (e.type === 'fake_exit' && !e.revealed) {
                e.revealed = true;
                die();
                return;
            }
        }
    }

    // Reactive Traps
    if (triggers.doorsMoved) {
        entities.forEach(e => {
            if (e.type === 'moving_exit' && e.x < e.targetX) {
                e.x += 4;
            }
        });
    }

    entities.forEach(e => {
        if (e.type === 'ceiling_spike') {
            if (triggers.spikesDropped || Math.abs((player.x + player.w/2) - (e.x + e.w/2)) < 80) {
                e.active = true;
            }
            if (e.active) {
                e.y += 12;
                if (checkCollision(player, e)) {
                    die();
                    return;
                }
            }
        }
    });

    if (triggers.bridgeVisible) {
        tiles.forEach(t => {
            if (t.type === 'invisible') {
                t.solid = true;
            }
        });
    }
}

function drawCharacter() {
    ctx.save();
    
    // Draw trail
    for (let i = 0; i < player.trail.length; i++) {
        let pt = player.trail[i];
        let alpha = i / player.trail.length;
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.3})`;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 10;
        ctx.fillRect(pt.x, pt.y, pt.w, pt.h);
    }
    ctx.shadowBlur = 0;

    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    ctx.translate(cx, cy);

    if (player.facingLeft) ctx.scale(-1, 1);
    if (player.inverted) ctx.scale(1, -1);
    if (player.h < 30) ctx.scale(0.6, 0.6); // Antman

    let sx = 1, sy = 1;
    if (!player.grounded) {
        if (Math.abs(player.vy) > 2) { sx = 0.85; sy = 1.15; }
    } else {
        if (Math.abs(player.vx) > 0.1) {
            let squeeze = Math.sin(Date.now() / 50) * 0.1;
            sx = 1 + squeeze;
            sy = 1 - squeeze;
        }
    }
    ctx.scale(sx, sy);

    const bw = 24, bh = 32;
    
    // Neon Slime Body
    ctx.fillStyle = '#051122';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 15;
    
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(-bw/2 + r, -bh/2);
    ctx.lineTo(bw/2 - r, -bh/2);
    ctx.arcTo(bw/2, -bh/2, bw/2, -bh/2 + r, r);
    ctx.lineTo(bw/2, bh/2 - r);
    ctx.arcTo(bw/2, bh/2, bw/2 - r, bh/2, r);
    ctx.lineTo(-bw/2 + r, bh/2);
    ctx.arcTo(-bw/2, bh/2, -bw/2, bh/2 - r, r);
    ctx.lineTo(-bw/2, -bh/2 + r);
    ctx.arcTo(-bw/2, -bh/2, -bw/2 + r, -bh/2, r);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cute Neon Eyes
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(2, -4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
}

function draw() {
    // Cyberpunk grid background
    const bgGradient = ctx.createRadialGradient(CANVAS_W/2, CANVAS_H/2, 0, CANVAS_W/2, CANVAS_H/2, CANVAS_W);
    bgGradient.addColorStop(0, '#02050A');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle Perspective Grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_W; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_H); ctx.stroke();
    }
    for (let i = 0; i < CANVAS_H; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_W, i); ctx.stroke();
    }

    if (isDevModeActive()) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 20; c++) {
                ctx.fillText(String.fromCharCode(65 + r) + c, c * 40 + 3, r * 40 + 13);
            }
        }
    }

    // Particles (Cyan/Teal)
    ctx.fillStyle = '#00E5FF';
    for (let p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    ctx.save();
    if (screenFlipped) { ctx.translate(CANVAS_W, 0); ctx.scale(-1, 1); }

    // Tiles
    for (let t of tiles) {
        if (t.type === 'wall' || t.type === 'phantom' || t.type === 'instant_phantom' || t.type === 'magic_platform' || (t.type === 'seq_platform' && t.visible)) {
            ctx.fillStyle = (t.type === 'phantom' || t.type === 'instant_phantom') && t.triggered ? '#0A0A0A' : '#05111A';
            ctx.fillRect(t.x, t.y, t.w, t.h);
            
            // Neon Top Edge
            ctx.fillStyle = (t.type === 'phantom' || t.type === 'instant_phantom') && t.triggered ? '#333' : '#00E5FF';
            ctx.shadowColor = (t.type === 'phantom' || t.type === 'instant_phantom') && t.triggered ? 'transparent' : '#00E5FF';
            ctx.shadowBlur = 10;
            ctx.fillRect(t.x, t.y, t.w, 4);
            ctx.shadowBlur = 0;
            
            // Faint border
            ctx.strokeStyle = '#021A2A';
            ctx.lineWidth = 1;
            ctx.strokeRect(t.x, t.y, t.w, t.h);
        } else if ((t.type === 'invisible' && t.solid) || (t.type === 'invisible_fake' && triggers.bridgeVisible)) {
            ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.strokeRect(t.x, t.y, t.w, t.h);
            ctx.fillRect(t.x, t.y, t.w, t.h);
        } else if (t.type === 'invisible_solid' && t.revealed) {
            ctx.fillStyle = 'rgba(255, 0, 85, 0.1)';
            ctx.strokeStyle = 'rgba(255, 0, 85, 0.4)';
            ctx.shadowColor = '#FF0055';
            ctx.shadowBlur = 10;
            ctx.strokeRect(t.x, t.y, t.w, t.h);
            ctx.fillRect(t.x, t.y, t.w, t.h);
            ctx.shadowBlur = 0;
        }
    }

    // Entities
    const time = Date.now();
    for (let e of entities) {
        if (e.type === 'exit' || e.type === 'moving_exit' || e.type === 'bouncing_exit' || e.type === 'fake_exit') {
            const isFake = e.type === 'fake_exit' && e.revealed;
            const color = isFake ? '#FF0055' : '#00FF66';
            
            // Swirling Portal
            ctx.save();
            ctx.translate(e.x + e.w/2, e.y + e.h/2);
            ctx.rotate(time / 500);
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.arc(0, 0, 15 + Math.sin(time/200)*2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(0, 0, 8 - Math.sin(time/200)*2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        } else if (e.type === 'spike' || e.type === 'ceiling_spike' || e.type === 'harmless_spike' || e.type === 'shooting_spike' || e.type === 'shift_spike') {
            // High-tech laser spike
            const cx = e.x + e.w/2;
            const cy = (e.type === 'spike' || e.type === 'harmless_spike' || e.type === 'shooting_spike' || e.type === 'shift_spike') ? e.y + e.h : e.y;
            const tipY = (e.type === 'spike' || e.type === 'harmless_spike' || e.type === 'shooting_spike' || e.type === 'shift_spike') ? e.y : e.y + e.h;
            
            ctx.fillStyle = '#111';
            ctx.fillRect(e.x + 5, cy === e.y ? cy : cy - 5, e.w - 10, 5); // base
            
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy);
            ctx.lineTo(cx, tipY);
            ctx.lineTo(cx + 3, cy);
            
            ctx.fillStyle = '#FF0055';
            ctx.shadowColor = '#FF0055';
            ctx.shadowBlur = 15;
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(cx - 1, cy);
            ctx.lineTo(cx, tipY);
            ctx.lineTo(cx + 1, cy);
            ctx.fill();
        } else if (e.type === 'shrink' || e.type === 'gravity') {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
            ctx.strokeStyle = '#f0f';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#f0f';
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.arc(e.x + e.w/2, e.y + e.h/2, 12 + Math.sin(time/150)*3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    if (triggers.wallChaseActive) {
        // Sci-Fi Laser Wall
        const grad = ctx.createLinearGradient(wallChaseX - 50, 0, wallChaseX, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(255, 0, 85, 0.8)');
        ctx.fillStyle = grad;
        ctx.fillRect(wallChaseX - 50, 0, 50, CANVAS_H);
        
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#FF0055';
        ctx.shadowBlur = 20;
        ctx.fillRect(wallChaseX - 2, 0, 4, CANVAS_H);
        ctx.shadowBlur = 0;
    }

    drawCharacter();

    ctx.restore();
}

function loop() {
    if (currentPlaylistIndex >= 5) return;
    update();
    draw();
    animationId = requestAnimationFrame(loop);
}

export function destroy() {
    window.removeEventListener('resize', boundResize);
    document.removeEventListener('keydown', boundKeydown);
    document.removeEventListener('keyup', boundKeyup);
    cancelAnimationFrame(animationId);
}
