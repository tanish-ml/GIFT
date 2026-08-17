import { unlockStage, isDevModeActive } from '../../core/state.js';
import { getGlobalVolume, setGlobalVolume, toggleMusic, forceTrack } from '../../core/audio.js';
import { applyCyberpunkDecoder } from '../../core/ui.js';

let canvas, ctx;
let cols, rows;
let cellSize = 30; // Decreased from 40 to increase maze length by ~33%
let grid = [];
let player = { r: 0, c: 0 };
let inverted = false;
let cameraFlipped = false;
let invertInterval;
let animationFrameId;
let gamePaused = false;
let timeUntilNextInvert = 10000;
let lastInvertTime = 0;

export function init() {
    forceTrack('/music/hauntsync-dark-synthwave-instrumental-electronic-warfare-comes-235884.mp3');
    setGlobalVolume(0.3);
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="stage2-container">
            <canvas id="maze-canvas"></canvas>
            <div id="warning-overlay" class="warning-overlay">CONTROLS JUMBLED</div>
            <div class="controls-hint">Use WASD or Arrows to escape. Follow the neon.</div>
            <button id="btn-dev-fix-wasd" class="btn-submit" style="display:none; position:absolute; top:40px; left:30px; width:auto; border-color:#0ff; color:#0ff; z-index:9999; font-size:12px; padding: 5px 10px;">[DEV] Fix WASD</button>
            <button id="btn-dev-new-maze" class="btn-submit" style="display:none; position:absolute; top:40px; left:150px; width:auto; border-color:#0ff; color:#0ff; z-index:9999; font-size:12px; padding: 5px 10px;">[DEV] New Maze</button>
            
            <div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center;">
                  <h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 2 INSTRUCTIONS</h2>
                  <p style="font-size: 18px; margin-bottom: 10px;">Use WASD or Arrow Keys to navigate the maze. Find the exit portal.</p>
                  <p style="font-size: 18px; margin-bottom: 30px;">Beware: corrupted glitches may temporarily invert your controls, and false portals will transport you or shuffle the maze.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press 'H' to resume.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p>
                <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="vol-slider-2" style="font-size: 14px;">Music Volume</label>
                    <input type="range" id="vol-slider-2" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="btn-toggle-music-2" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button>
                        <button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    canvas = document.getElementById('maze-canvas');
    ctx = canvas.getContext('2d');
    
    gamePaused = false;
    
    if (isDevModeActive()) {
        document.getElementById('btn-dev-fix-wasd').style.display = 'block';
        document.getElementById('btn-dev-new-maze').style.display = 'block';
    }
    
    document.getElementById('btn-dev-fix-wasd').addEventListener('click', () => {
        clearTimeout(invertInterval);
        inverted = false;
        const container = document.querySelector('.stage2-container');
        const warning = document.getElementById('warning-overlay');
        if(container) container.classList.remove('glitch-effect');
        if(warning) warning.classList.remove('show');
    });

    document.getElementById('btn-dev-new-maze').addEventListener('click', () => {
        sessionStorage.removeItem('maze_grid');
        sessionStorage.removeItem('maze_player_pos');
        sessionStorage.removeItem('maze_camera_flipped');
        
        // Cleanup old event listeners before re-init
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', handleResize);
        clearTimeout(invertInterval);
        cancelAnimationFrame(animationFrameId);
        
        init();
    });

    // Resize and initialize grid
    resizeCanvas();
    
    const savedGrid = sessionStorage.getItem('maze_grid');
    if (savedGrid) {
        grid = JSON.parse(savedGrid);
        rows = grid.length;
        cols = grid[0].length;
        const savedPos = sessionStorage.getItem('maze_player_pos');
        if (savedPos) {
            player = JSON.parse(savedPos);
        } else {
            player = { r: 0, c: 0 };
        }
        const savedFlip = sessionStorage.getItem('maze_camera_flipped');
        if (savedFlip) {
            cameraFlipped = savedFlip === 'true';
        }
    } else {
        player = { r: 0, c: 0 };
        generateMaze();
        solveMaze(); // For dev mode golden thread
        placeTraps();
    }

    // Start loops
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    
    inverted = false;
    gamePaused = false;
    timeUntilNextInvert = 10000;
    lastInvertTime = Date.now();
    invertInterval = setTimeout(triggerInversion, timeUntilNextInvert);
    
    const volSlider = document.getElementById('vol-slider-2');
    if (volSlider) {
        volSlider.addEventListener('input', (ev) => {
            setGlobalVolume(parseFloat(ev.target.value));
        });
    }

    const btnToggle = document.getElementById('btn-toggle-music-2');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleMusic();
        });
    }
    
    draw();
}


function generateMaze() {
    grid = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                r, c,
                walls: { top: true, right: true, bottom: true, left: true },
                inMaze: false,
                isTrap: false,
                isPath: false
            });
        }
        grid.push(row);
    }

    // Randomized Prim's Algorithm for lots of branches and dead ends
    let frontier = [];
    grid[0][0].inMaze = true;
    
    const addFrontier = (r, c) => {
        if (r > 0 && !grid[r - 1][c].inMaze) frontier.push({ cell: grid[r - 1][c], from: grid[r][c], dir: 'top' });
        if (c < cols - 1 && !grid[r][c + 1].inMaze) frontier.push({ cell: grid[r][c + 1], from: grid[r][c], dir: 'right' });
        if (r < rows - 1 && !grid[r + 1][c].inMaze) frontier.push({ cell: grid[r + 1][c], from: grid[r][c], dir: 'bottom' });
        if (c > 0 && !grid[r][c - 1].inMaze) frontier.push({ cell: grid[r][c - 1], from: grid[r][c], dir: 'left' });
    };
    
    addFrontier(0, 0);

    while (frontier.length > 0) {
        let idx = Math.floor(Math.random() * frontier.length);
        let next = frontier[idx];
        frontier.splice(idx, 1);
        
        let cell = next.cell;
        if (cell.inMaze) continue;
        
        if (next.dir === 'top') { cell.walls.bottom = false; next.from.walls.top = false; }
        if (next.dir === 'right') { cell.walls.left = false; next.from.walls.right = false; }
        if (next.dir === 'bottom') { cell.walls.top = false; next.from.walls.bottom = false; }
        if (next.dir === 'left') { cell.walls.right = false; next.from.walls.left = false; }
        
        cell.inMaze = true;
        addFrontier(cell.r, cell.c);
    }
}

function solveMaze() {
    let queue = [{ r: 0, c: 0, path: [] }];
    let visited = Array(rows).fill().map(() => Array(cols).fill(false));
    visited[0][0] = true;

    while (queue.length > 0) {
        let curr = queue.shift();
        if (curr.r === rows - 1 && curr.c === cols - 1) {
            for (let p of curr.path) {
                grid[p.r][p.c].isPath = true;
            }
            grid[rows - 1][cols - 1].isPath = true;
            break;
        }

        let cell = grid[curr.r][curr.c];
        const add = (nr, nc) => {
            if (!visited[nr][nc]) {
                visited[nr][nc] = true;
                queue.push({ r: nr, c: nc, path: [...curr.path, { r: curr.r, c: curr.c }] });
            }
        };

        if (!cell.walls.top) add(curr.r - 1, curr.c);
        if (!cell.walls.right) add(curr.r, curr.c + 1);
        if (!cell.walls.bottom) add(curr.r + 1, curr.c);
        if (!cell.walls.left) add(curr.r, curr.c - 1);
    }
}

function placeTraps() {
    // 1. Calculate distance from the critical path for every cell using BFS
    let queue = [];
    let distances = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    
    // Initialize queue with all path cells (distance 0)
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c].isPath) {
                queue.push({r, c});
                distances[r][c] = 0;
            }
        }
    }
    
    // BFS to compute shortest traversal distances from the main path
    while (queue.length > 0) {
        let curr = queue.shift();
        let cell = grid[curr.r][curr.c];
        let d = distances[curr.r][curr.c];
        
        const add = (nr, nc) => {
            if (distances[nr][nc] === Infinity) {
                distances[nr][nc] = d + 1;
                queue.push({r: nr, c: nc});
            }
        };
        
        if (!cell.walls.top) add(curr.r - 1, curr.c);
        if (!cell.walls.right) add(curr.r, curr.c + 1);
        if (!cell.walls.bottom) add(curr.r + 1, curr.c);
        if (!cell.walls.left) add(curr.r, curr.c - 1);
    }
    
    // 2. Pick candidate cells that are exactly distance 2 or 3 away from the critical path.
    // Prefer T-junctions (wallCount === 1), then fall back to hallways (wallCount === 2).
    let candidates = [];
    let fallbackCandidates = [];
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r === 0 && c === 0) continue;
            if (r === rows - 1 && c === cols - 1) continue;
            
            let cell = grid[r][c];
            let d = distances[r][c];
            let wallCount = (cell.walls.top ? 1 : 0) + (cell.walls.right ? 1 : 0) + (cell.walls.bottom ? 1 : 0) + (cell.walls.left ? 1 : 0);
            
            if (d === 2 || d === 3) {
                if (wallCount === 1) {
                    candidates.push(cell); // Ideal: T-junction (touches 1 wall)
                } else if (wallCount === 2) {
                    fallbackCandidates.push(cell); // Fallback: Hallway (touches 2 walls)
                }
            }
        }
    }
    
    // Shuffle arrays
    candidates.sort(() => Math.random() - 0.5);
    fallbackCandidates.sort(() => Math.random() - 0.5);
    
    // Combine arrays, preferring the ideal candidates
    let finalSelection = [...candidates, ...fallbackCandidates];

    // Extreme fallback if maze generation was very tight
    if (finalSelection.length < 6) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let cell = grid[r][c];
                let d = distances[r][c];
                let wallCount = (cell.walls.top ? 1 : 0) + (cell.walls.right ? 1 : 0) + (cell.walls.bottom ? 1 : 0) + (cell.walls.left ? 1 : 0);
                if (d > 1 && wallCount < 3 && !finalSelection.includes(cell)) {
                    finalSelection.push(cell);
                }
            }
        }
    }

    // Pick 6 spaced-out traps
    let spacedTraps = [];
    let minDistance = 5; // Start with strict spatial separation (Manhattan distance)

    // Iteratively lower spacing requirement if we can't find enough spots
    while (spacedTraps.length < 6 && minDistance >= 0) {
        spacedTraps = [];
        for (let cell of finalSelection) {
            if (spacedTraps.length >= 6) break;
            
            let tooClose = false;
            for (let t of spacedTraps) {
                let dist = Math.abs(t.r - cell.r) + Math.abs(t.c - cell.c);
                if (dist < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                spacedTraps.push(cell);
            }
        }
        minDistance--;
    }

    // Activate the final selected traps
    for (let t of spacedTraps) {
        t.isTrap = true;
    }
}

function handleKeyDown(e) {
        
    if (e.key.toLowerCase() === 'h') {
        gamePaused = !gamePaused;
        const popup = document.getElementById('instruction-popup');
        if (popup) popup.style.display = gamePaused ? 'flex' : 'none';
        
        if (gamePaused) {
            clearTimeout(invertInterval);
            // Calculate remaining time
            const elapsed = Date.now() - lastInvertTime;
            timeUntilNextInvert = Math.max(0, timeUntilNextInvert - elapsed);
            
            const slider = document.getElementById('vol-slider-2');
            if (slider) slider.value = getGlobalVolume();
        } else {
            lastInvertTime = Date.now();
            invertInterval = setTimeout(triggerInversion, timeUntilNextInvert);
        }
        return;
    }

    if (gamePaused) return;

    let key = e.key.toLowerCase();
    
    let moveMap = {
        'w': 'up', 'arrowup': 'up',
        's': 'down', 'arrowdown': 'down',
        'a': 'left', 'arrowleft': 'left',
        'd': 'right', 'arrowright': 'right'
    };
    
    let action = moveMap[key];
    if (!action) return;
    
    if (inverted) {
        if (action === 'up') action = 'down';
        else if (action === 'down') action = 'up';
        else if (action === 'left') action = 'right';
        else if (action === 'right') action = 'left';
    }
    
    let cell = grid[player.r][player.c];
    if (action === 'up' && !cell.walls.top) player.r--;
    if (action === 'down' && !cell.walls.bottom) player.r++;
    if (action === 'left' && !cell.walls.left) player.c--;
    if (action === 'right' && !cell.walls.right) player.c++;
    
    checkWinOrTrap();
}

function triggerInversion() {
    // 50% chance to flip inversion state
    if (Math.random() < 0.5) {
        inverted = !inverted;
        const container = document.querySelector('.stage2-container');
        const warning = document.getElementById('warning-overlay');
        
        if (inverted) {
            container.classList.add('glitch-effect');
            warning.classList.add('show');
            setTimeout(() => {
                if(container) container.classList.remove('glitch-effect');
                if(warning) warning.classList.remove('show');
            }, 600);
        } else {
            // Minor glitch when restoring to normal
            container.classList.add('glitch-effect');
            setTimeout(() => {
                if(container) container.classList.remove('glitch-effect');
            }, 200);
        }
    }
    
    timeUntilNextInvert = 5000 + Math.random() * 8000;
    lastInvertTime = Date.now();
    invertInterval = setTimeout(triggerInversion, timeUntilNextInvert);
}

function checkWinOrTrap() {
    const cell = grid[player.r][player.c];
    const isTrap = cell.isTrap && !isDevModeActive();
    const isExit = player.r === rows - 1 && player.c === cols - 1;
    
    if (isTrap || isExit) {
        document.removeEventListener('keydown', handleKeyDown);
        clearTimeout(invertInterval);
        cancelAnimationFrame(animationFrameId);
        
        const flash = document.createElement('div');
        flash.id = 'portal-prompt';
        flash.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,255,0,0.9); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding: 20px; box-sizing: border-box; font-family:monospace;';
        flash.innerHTML = `
            <div id="portal-msg" style="font-size:30px; font-weight:bold; color:#000; margin-bottom: 40px;">
                You found the portal. It might be the passage to the next phase, or it might be a trap.
            </div>
            <div id="portal-controls" style="display:flex; gap:20px; font-size:20px; flex-wrap:wrap; justify-content:center;">
                <button id="btn-enter-portal" style="padding:15px 30px; font-size:20px; font-family:monospace; font-weight:bold; background:#000; color:#0f0; border:2px solid #000; cursor:pointer; text-transform:uppercase;">ENTER PORTAL</button>
                <button id="btn-skip-portal" style="padding:15px 30px; font-size:20px; font-family:monospace; font-weight:bold; background:transparent; color:#000; border:2px solid #000; cursor:pointer; text-transform:uppercase;">SKIP & KEEP SEARCHING</button>
            </div>
        `;
        document.body.appendChild(flash);
        
        const handleSkip = () => {
            flash.remove();
            // Resume game
            document.addEventListener('keydown', handleKeyDown);
            timeUntilNextInvert = 5000 + Math.random() * 8000;
            lastInvertTime = Date.now();
            invertInterval = setTimeout(triggerInversion, timeUntilNextInvert);
            draw();
        };

        const handleEnter = () => {
            if (isExit) {
                flash.remove();
                sessionStorage.removeItem('maze_grid'); // Clean up
                sessionStorage.removeItem('maze_player_pos');
                sessionStorage.removeItem('maze_camera_flipped');
                unlockStage(3);
                window.transitionToStage(3);
            } else {
                // It's a trap
                document.getElementById('portal-msg').innerText = "FATAL ERROR: TRAP TRIGGERED.";
                document.getElementById('portal-msg').style.color = "#f00";
                document.getElementById('portal-controls').style.display = "none";
                
                // Static / Glitch FX
                flash.style.background = "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noise\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noise)\"/></svg>')";
                flash.style.opacity = "0.8";
                flash.style.mixBlendMode = "screen";
                
                // Disable this specific trap
                cell.isTrap = false;
                
                // Random Penalty: Teleport or Flip
                const penalty = Math.random() < 0.5 ? 'teleport' : 'flip';
                
                setTimeout(() => {
                    flash.remove();
                    
                    if (penalty === 'teleport') {
                        player.r = 0;
                        player.c = 0;
                    } else {
                        cameraFlipped = !cameraFlipped;
                    }
                    
                    sessionStorage.setItem('maze_grid', JSON.stringify(grid));
                    sessionStorage.setItem('maze_player_pos', JSON.stringify(player));
                    sessionStorage.setItem('maze_camera_flipped', cameraFlipped);
                    
                    document.addEventListener('keydown', handleKeyDown);
                    timeUntilNextInvert = 5000 + Math.random() * 8000;
                    lastInvertTime = Date.now();
                    invertInterval = setTimeout(triggerInversion, timeUntilNextInvert);
                    animationFrameId = requestAnimationFrame(draw);
                }, 1500);
            }
        };

        document.getElementById('btn-enter-portal').addEventListener('click', handleEnter);
        document.getElementById('btn-skip-portal').addEventListener('click', handleSkip);
    }
}

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform for clearing
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const offsetX = (canvas.width - (cols * cellSize)) / 2;
    const offsetY = (canvas.height - (rows * cellSize)) / 2;
    
    ctx.translate(offsetX, offsetY); // apply offset to ctx
    
    if (cameraFlipped) {
        ctx.translate((cols * cellSize) / 2, (rows * cellSize) / 2);
        ctx.rotate(Math.PI); // 180 degrees
        ctx.translate(-(cols * cellSize) / 2, -(rows * cellSize) / 2);
    }
    
    const devMode = isDevModeActive();

    // Draw cells
    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
            let x = c * cellSize;
            let y = r * cellSize;
            let cell = grid[r][c];
            
            // Dev mode path highlighting
            if (devMode && cell.isPath) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.fillRect(x, y, cellSize, cellSize);
            }
            
            // Draw Traps (in red if dev mode)
            if (devMode && cell.isTrap) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10);
            }

            // Draw Exit
            if (r === rows - 1 && c === cols - 1) {
                ctx.fillStyle = '#0f0';
                ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10);
            }
            
            // Draw Walls
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (cell.walls.top) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
            if (cell.walls.right) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
            if (cell.walls.bottom) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); }
            if (cell.walls.left) { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); }
            ctx.stroke();
        }
    }
    
    // Draw Player
    let px = player.c * cellSize + cellSize / 2;
    let py = player.r * cellSize + cellSize / 2;
    ctx.fillStyle = inverted ? '#f00' : '#fff'; // Turn player red if inverted
    ctx.beginPath();
    ctx.arc(px, py, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Fog of War (Spotlight)
    if (!devMode) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform for the full screen gradient overlay
        
        let drawPx = px;
        let drawPy = py;
        
        if (cameraFlipped) {
            drawPx = (cols * cellSize) - px;
            drawPy = (rows * cellSize) - py;
        }
        
        // We need the absolute coordinates of the player for the gradient
        const offsetX = (canvas.width - (cols * cellSize)) / 2;
        const offsetY = (canvas.height - (rows * cellSize)) / 2;
        const absPx = drawPx + offsetX;
        const absPy = drawPy + offsetY;
        const radius = cellSize * 5; 
        
        let gradient = ctx.createRadialGradient(absPx, absPy, radius * 0.2, absPx, absPy, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.98)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
    
    animationFrameId = requestAnimationFrame(draw);
}

export function destroy() {
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', handleResize);
    clearTimeout(invertInterval);
    cancelAnimationFrame(animationFrameId);
    
    // FIX: Clean up lingering portal prompts if routed away early
    const prompt = document.getElementById('portal-prompt');
    if (prompt) prompt.remove();
    
    const app = document.getElementById('app');
    app.innerHTML = '';
}



