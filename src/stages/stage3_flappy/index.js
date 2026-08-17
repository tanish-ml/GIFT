import { unlockStage, isDevModeActive } from '../../core/state.js';
import { getGlobalVolume, setGlobalVolume, toggleMusic, forceTrack } from '../../core/audio.js';
import { applyCyberpunkDecoder } from '../../core/ui.js';

let animationId;
let canvas, ctx;
let bird, pipes;
let score = 0;
let frames = 0;
let gameOver = false;
let gameWon = false;
let gameStarted = false;
let invertedGravity = false;
let movingPipes = false;
let gamePaused = false;
let penaltyTriggered = false;

// Input listeners
let boundKeydown, boundClick, boundRestart, boundTrap, boundResize, boundTouch;

export function init() {
    forceTrack('/music/hitslab-cyberpunk-cyberpunk-music-542589.mp3');
    setGlobalVolume(0.3);
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="stage3-flappy-container">
            <div class="flappy-score" id="flappy-score">0</div>
            <div class="flappy-warning" id="flappy-warning">GRAVITY INVERTED</div>
            <div class="flappy-start-popup" id="flappy-popup">Use 'W' to flap UP<br>Use 'S' to flap DOWN</div>
            <canvas id="flappy-canvas"></canvas>
            
            <div class="flappy-overlay" id="flappy-overlay">
                <h2 id="overlay-title">SYSTEM FAILURE</h2>
                <p id="overlay-msg">Collision detected.</p>
                <button class="flappy-btn" id="btn-restart">Reboot Sequence</button>
                <button class="flappy-btn flappy-btn-trap" id="btn-trap">Skip Level / Need Help?</button>
            </div>

            <div class="flappy-overlay" id="flappy-win-overlay" style="border-color:#0f0; box-shadow:0 0 20px #0f0;">
                <h2 style="color:#0f0; text-shadow:0 0 10px #0f0;">NICE SKILLS</h2>
                <p style="color:#0f0;">Please press Enter to move to next phase</p>
                <button class="flappy-btn" id="btn-next">Proceed</button>
            </div>
            
            <div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center;">
                <h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 3 INSTRUCTIONS</h2>
                <p style="font-size: 18px; margin-bottom: 10px;">Use 'W' to flap up, or 'S' to flap down when gravity inverts.</p>
                <p style="font-size: 18px; margin-bottom: 30px;">Navigate through the firewall pipes. Reach a score of 8 to clear the stage.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press 'H' to resume.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p>
                <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="vol-slider-3" style="font-size: 14px;">Music Volume</label>
                    <input type="range" id="vol-slider-3" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="btn-toggle-music-3" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button>
                        <button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    canvas = document.getElementById('flappy-canvas');
    ctx = canvas.getContext('2d');
    
    // Resize canvas
    boundResize = () => {
        const container = document.querySelector('.stage3-flappy-container');
        if (container) {
            canvas.width = Math.min(1200, window.innerWidth);
            canvas.height = Math.min(600, window.innerHeight * 0.8);
        }
    };
    window.addEventListener('resize', boundResize);
    boundResize();

    // Bind UI buttons
    boundRestart = () => resetGame();
    boundTrap = () => { 
        if (penaltyTriggered) return;
        penaltyTriggered = true;
        
        const title = document.getElementById('overlay-title');
        const msg = document.getElementById('overlay-msg');
        title.innerText = "PENALTY IMPOSED";
        title.style.color = "#f00";
        msg.innerText = "Sorry no help here. As a penalty we are kicking you down a level.";
        msg.style.color = "#f00";
        document.getElementById('btn-restart').style.display = "none";
        document.getElementById('btn-trap').style.display = "none";
        
        setTimeout(() => {
            window.goToStage(2);
        }, 3000);
    };
    document.getElementById('btn-restart').addEventListener('click', boundRestart);
    document.getElementById('btn-trap').addEventListener('click', boundTrap);
    
    const goNext = () => {
        unlockStage(4);
        window.transitionToStage(4);
    };
    document.getElementById('btn-next').addEventListener('click', goNext);

    // Bind controls
    const instrTitle = document.querySelector('#instruction-popup h2');
    if (instrTitle) applyCyberpunkDecoder(instrTitle);

    boundKeydown = (e) => {
        if (e.key.toLowerCase() === 'h') {
            gamePaused = !gamePaused;
            document.getElementById('instruction-popup').style.display = gamePaused ? 'flex' : 'none';
            if (gamePaused) {
                const slider = document.getElementById('vol-slider-3');
                if (slider) slider.value = getGlobalVolume();
            }
            return;
        }

        if (gameWon && e.code === 'Enter') {
            const winOverlay = document.getElementById('flappy-win-overlay');
            if (winOverlay && winOverlay.style.display === 'flex') {
                goNext();
            }
        }
        
        if (gameOver || gameWon || !gameStarted || gamePaused) return;
        
        if ((e.code === 'KeyW' || e.key === 'w' || e.code === 'ArrowUp') && !invertedGravity) {
            e.preventDefault();
            flap();
        }
        
        if ((e.code === 'KeyS' || e.key === 's' || e.code === 'ArrowDown') && invertedGravity) {
            e.preventDefault();
            flap();
        }

        if (gameOver && e.code === 'Enter') {
            resetGame();
        }
    };
    // Mouse clicks are disabled to enforce W/S usage
    boundClick = (e) => {};
    
    // Allow Enter to Restart on Game Over inside boundKeydown
    
    boundTouch = (e) => {
        if (e.target === canvas && !gameOver && !gameWon) {
            e.preventDefault(); // prevent mouse emulation
            flap();
        }
    };
    
    document.addEventListener('keydown', boundKeydown);
    document.addEventListener('mousedown', boundClick);
    document.addEventListener('touchstart', boundTouch, {passive: false});

    
    const volSlider = document.getElementById('vol-slider-3');
    if (volSlider) {
        volSlider.addEventListener('input', (ev) => {
            setGlobalVolume(parseFloat(ev.target.value));
        });
    }

    const btnToggle = document.getElementById('btn-toggle-music-3');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleMusic();
        });
    }

    resetGame();
    loop();
}

function resetGame() {
    bird = {
        x: canvas.width / 3,
        y: canvas.height / 2,
        velocity: 0,
        gravity: 0.12,
        jump: -3.5,
        size: 20
    };
    pipes = [];
    score = 0;
    frames = 0;
    gameOver = false;
    gameWon = false;
    gameStarted = false;
    invertedGravity = false;
    movingPipes = false;
    gamePaused = false;
    penaltyTriggered = false;
    
    document.getElementById('flappy-score').innerText = score;
    document.getElementById('flappy-score').classList.remove('glitch-win');
    document.getElementById('flappy-warning').style.display = 'none';
    document.getElementById('flappy-overlay').style.display = 'none';
    document.getElementById('flappy-win-overlay').style.display = 'none';
    
    const popup = document.getElementById('flappy-popup');
    if (popup) {
        popup.style.display = 'block';
        setTimeout(() => {
            popup.style.display = 'none';
            gameStarted = true;
        }, 3000);
    }
}

function flap() {
    bird.velocity = bird.jump;
}

function triggerWin() {
    gameWon = true;
    document.getElementById('flappy-warning').innerText = 'STAGE CLEAR';
    document.getElementById('flappy-warning').classList.add('glitch-win');
    document.getElementById('flappy-warning').style.display = 'block';
    document.getElementById('flappy-score').classList.add('glitch-win');
    
    setTimeout(() => {
        document.getElementById('flappy-warning').style.display = 'none';
        document.getElementById('flappy-win-overlay').style.display = 'flex';
    }, 1500);
}

function loop() {
    if (gameOver || gameWon) {
        if (!gameWon) {
            const overlay = document.getElementById('flappy-overlay');
            if (overlay.style.display !== 'flex') {
                overlay.style.display = 'flex';
                document.getElementById('overlay-title').innerText = "SYSTEM FAILURE";
                document.getElementById('overlay-title').style.color = "#0ff";
                document.getElementById('overlay-msg').innerText = "Collision detected.";
                document.getElementById('overlay-msg').style.color = "#0ff";
                document.getElementById('btn-restart').style.display = "inline-block";
                document.getElementById('btn-trap').style.display = "inline-block";
            }
        }
        animationId = requestAnimationFrame(loop);
        return; // Pause physics
    }

    if (gamePaused) {
        animationId = requestAnimationFrame(loop);
        return;
    }

    if (gameStarted) {
        // --- PHYSICS ---
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Twist checks
        if (score === 3 && !invertedGravity) {
            invertedGravity = true;
            bird.gravity = -0.12;
            bird.jump = 3.5;
            const warning = document.getElementById('flappy-warning');
            warning.innerText = 'GRAVITY INVERTED';
            warning.style.display = 'block';
            setTimeout(() => { warning.style.display = 'none'; }, 2000);
        }
        if (score === 4) {
            movingPipes = true;
        }
        if (score === 8 && !gameWon) {
            triggerWin();
        }

        // Pipe Spawning
        if (frames % 200 === 0) {
            let gap = 300;
            const minHeight = 50;
            if (canvas.height < gap + minHeight * 2) {
                gap = canvas.height - minHeight * 2;
            }
            const maxHeight = canvas.height - minHeight - gap;
            const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
            
            pipes.push({
                x: canvas.width,
                top: topHeight,
                gap: gap,
                width: 50,
                passed: false,
                timeOffset: Math.random() * Math.PI * 2 // For moving pipes
            });
        }

        // Update Pipes
        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            p.x -= 1.5; // speed
            
            if (movingPipes) {
                // Oscillate gap up and down
                p.top += Math.sin((frames / 20) + p.timeOffset) * 2;
            }

            // Collision detection
            if (
                bird.x + bird.size > p.x && 
                bird.x < p.x + p.width
            ) {
                if (bird.y < p.top || bird.y + bird.size > p.top + p.gap) {
                    gameOver = true;
                }
            }

            // Score update
            if (p.x + p.width < bird.x && !p.passed) {
                score++;
                p.passed = true;
                document.getElementById('flappy-score').innerText = score;
            }
        }

        // Remove off-screen pipes
        if (pipes.length > 0 && pipes[0].x + pipes[0].width < 0) {
            pipes.shift();
        }

        // Floor/Ceiling collision
        if (bird.y + bird.size > canvas.height || bird.y < 0) {
            gameOver = true;
        }
    }

    // --- DRAWING ---
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid/terminal background lines (aesthetic)
    ctx.strokeStyle = '#020';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.height; i+=40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw Pipes
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        
        // Top pipe
        ctx.fillRect(p.x, 0, p.width, p.top);
        ctx.strokeRect(p.x, 0, p.width, p.top);
        
        // Bottom pipe
        const bottomY = p.top + p.gap;
        ctx.fillRect(p.x, bottomY, p.width, canvas.height - bottomY);
        ctx.strokeRect(p.x, bottomY, p.width, canvas.height - bottomY);
        
        // Draw terminal hash patterns on pipes
        ctx.fillStyle = '#0f0';
        ctx.font = '10px monospace';
        for(let yy = 10; yy < p.top; yy+=15) ctx.fillText('//', p.x + 15, yy);
        for(let yy = bottomY + 15; yy < canvas.height; yy+=15) ctx.fillText('//', p.x + 15, yy);
        ctx.fillStyle = '#000';
    }

    // Draw Bird
    ctx.fillStyle = '#0f0';
    ctx.fillRect(bird.x, bird.y, bird.size, bird.size);
    // Bird eye
    ctx.fillStyle = '#000';
    ctx.fillRect(bird.x + 12, (invertedGravity ? bird.y + 12 : bird.y + 4), 4, 4);

    frames++;
    animationId = requestAnimationFrame(loop);
}

export function destroy() {
    cancelAnimationFrame(animationId);
    document.removeEventListener('keydown', boundKeydown);
    document.removeEventListener('mousedown', boundClick);
    document.removeEventListener('touchstart', boundTouch);
    window.removeEventListener('resize', boundResize);
    
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) btnRestart.removeEventListener('click', boundRestart);
    const btnTrap = document.getElementById('btn-trap');
    if (btnTrap) btnTrap.removeEventListener('click', boundTrap);
}



