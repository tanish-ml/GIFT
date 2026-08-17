import { unlockStage } from '../../core/state.js';
import { getGlobalVolume, setGlobalVolume, toggleMusic, forceTrack } from '../../core/audio.js';
import { applyCyberpunkDecoder } from '../../core/ui.js';

let canvas, ctx;
let animationId;
let mouseX = -1000;
let mouseY = -1000;
let zoom = 3.5;

let ants = [];
const targetGlyphs = ['C', 'O', 'D', 'E'];
const decoyGlyphs = ['A', 'B', 'F', 'G', 'H', 'X', 'Y', 'Z', '0', '1', '@', '#', '$', '%'];
let captured = [];
let gameWon = false;
let gamePaused = false;

const BASE_SCALE = 0.3;

let boundMousemove, boundWheel, boundClick, boundResize, boundKeydown;

export function init() {
    forceTrack('/music/nveravetyanmusic-echo-drone-synthwave-house-419799.mp3');
    setGlobalVolume(0.3);
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="world-container">
            <canvas id="world-canvas"></canvas>
            
            <div class="world-ui">
                LENS POWER: <span id="ui-zoom">3.50x</span><br>
                Use scroll wheel to adjust magnification.
            </div>

            <div class="capture-ui" id="capture-tracker">
                [ _ _ _ _ ]
            </div>
            
            <div class="matrix-overlay" id="matrix-overlay"></div>
            
            <div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center; cursor:auto;">
                <h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 5 INSTRUCTIONS</h2>
                <p style="font-size: 18px; margin-bottom: 10px;">Use your scroll wheel to zoom in and out.</p>
                <p style="font-size: 18px; margin-bottom: 10px;">Search for the four carriers holding the letters C, O, D, and E.</p>
                <p style="font-size: 18px; margin-bottom: 30px;">Click them to extract the data.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press 'H' to resume.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p>
                <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="vol-slider-5" style="font-size: 14px;">Music Volume</label>
                    <input type="range" id="vol-slider-5" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="btn-toggle-music-5" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button>
                        <button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    canvas = document.getElementById('world-canvas');
    ctx = canvas.getContext('2d');

    boundResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', boundResize);
    boundResize();

    // Reset game state for fresh initialization
    ants = [];
    gameWon = false;
    gamePaused = false;
    captured = [];

    // 800 Normal Ants
    for (let i = 0; i < 800; i++) {
        ants.push({
            rx: Math.random(),
            ry: Math.random(),
            vx: (Math.random() - 0.5) * 0.001,
            vy: (Math.random() - 0.5) * 0.001,
            type: 'normal'
        });
    }
    
    // 20 Decoy Ants
    for (let i = 0; i < 20; i++) {
        ants.push({
            rx: Math.random(),
            ry: Math.random(),
            vx: (Math.random() - 0.5) * 0.002,
            vy: (Math.random() - 0.5) * 0.002,
            type: 'decoy',
            glyph: decoyGlyphs[Math.floor(Math.random() * decoyGlyphs.length)]
        });
    }

    // 4 Data Carrier Ants
    for (let g of targetGlyphs) {
        ants.push({
            rx: Math.random(),
            ry: Math.random(),
            vx: (Math.random() - 0.5) * 0.0004,
            vy: (Math.random() - 0.5) * 0.0004,
            type: 'carrier',
            glyph: g,
            captured: false
        });
    }

    boundMousemove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    boundWheel = (e) => {
        if (e.target !== canvas) return;
        e.preventDefault();
        
        zoom *= (e.deltaY > 0 ? 0.9 : 1.1);
        zoom = Math.max(2.5, Math.min(6.0, zoom));
        
        document.getElementById('ui-zoom').innerText = `${zoom.toFixed(2)}x`;
    };

    boundClick = (e) => {
        if (e.target !== canvas || gameWon || gamePaused) return;
        
        for (let a of ants) {
            if ((a.type === 'carrier' && !a.captured) || a.type === 'decoy') {
                const ax = a.rx * canvas.width;
                const ay = a.ry * canvas.height;
                const dist = Math.hypot(ax - mouseX, ay - mouseY);
                
                if (dist < 30) {
                    if (a.type === 'decoy') {
                        // Penalty: remove one captured letter
                        if (captured.length > 0) {
                            const removed = captured.pop();
                            for (let ca of ants) {
                                if (ca.type === 'carrier' && ca.glyph === removed && ca.captured) {
                                    ca.captured = false;
                                    ca.rx = Math.random();
                                    ca.ry = Math.random();
                                    break;
                                }
                            }
                            updateTracker();
                        }

                        // Screen shake
                        const container = document.querySelector('.world-container');
                        if (container) {
                            container.style.animation = 'none';
                            container.offsetHeight;
                            container.style.animation = 'screenShake 0.4s ease-out';
                            setTimeout(() => { container.style.animation = 'none'; }, 400);
                        }

                        // CRT glitch flash
                        const glitchOverlay = document.createElement('div');
                        glitchOverlay.style.cssText = 'position:fixed;inset:0;z-index:9000;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,0,0,0.06) 0px,rgba(255,0,0,0.06) 1px,transparent 1px,transparent 3px);mix-blend-mode:screen;';
                        const glitchFlash = document.createElement('div');
                        glitchFlash.style.cssText = 'position:fixed;inset:0;z-index:9001;pointer-events:none;background:rgba(255,0,0,0.15);';
                        document.body.appendChild(glitchOverlay);
                        document.body.appendChild(glitchFlash);
                        setTimeout(() => { glitchOverlay.remove(); glitchFlash.remove(); }, 300);

                        // Scatter the decoy
                        a.rx = Math.random();
                        a.ry = Math.random();
                        return;
                    } else if (a.type === 'carrier') {
                        a.captured = true;
                        captured.push(a.glyph);
                        updateTracker();
                        checkWin();
                        break;
                    }
                }
            }
        }
    };

    const instrTitle = document.querySelector('#instruction-popup h2');
    if (instrTitle) applyCyberpunkDecoder(instrTitle);

    boundKeydown = (e) => {
        if (e.key.toLowerCase() === 'h' && !gameWon) {
            gamePaused = !gamePaused;
            document.getElementById('instruction-popup').style.display = gamePaused ? 'flex' : 'none';
            if (gamePaused) {
                const slider = document.getElementById('vol-slider-5');
                if (slider) slider.value = getGlobalVolume();
            }
        }
    };

    document.addEventListener('mousemove', boundMousemove);
    document.addEventListener('wheel', boundWheel, { passive: false });
    document.addEventListener('click', boundClick);
    document.addEventListener('keydown', boundKeydown);
    
    const volSlider = document.getElementById('vol-slider-5');
    if (volSlider) {
        volSlider.addEventListener('input', (ev) => {
            setGlobalVolume(parseFloat(ev.target.value));
        });
    }

    const btnToggle = document.getElementById('btn-toggle-music-5');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleMusic();
        });
    }
    
    updateTracker();
    loop();
}

function updateTracker() {
    let display = '[ ';
    for (let i = 0; i < 4; i++) {
        if (i < captured.length) {
            display += captured[i] + ' ';
        } else {
            display += '_ ';
        }
    }
    display += ']';
    document.getElementById('capture-tracker').innerText = display;
}

function triggerMatrixBypass() {
    const overlay = document.getElementById('matrix-overlay');
    overlay.classList.add('active');
    
    // Matrix Rain effect in DOM
    let rainHTML = '';
    for(let i=0; i<100; i++) {
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        rainHTML += `<div style="position:absolute; left:${left}vw; top:${top}vh; animation: terminalGlitch ${0.2 + Math.random()}s infinite ${delay}s; opacity: ${Math.random()};">SYSTEM BYPASS OVERRIDE // ${Math.random().toString(36).substr(2, 8)}</div>`;
    }
    overlay.innerHTML = rainHTML;
}

function checkWin() {
    if (captured.length === 4) {
        gameWon = true;
        const tracker = document.getElementById('capture-tracker');
        tracker.classList.add('glitch-win');
        tracker.innerText = '[ SYSTEM BYPASS ]';
        
        triggerMatrixBypass();
        
        setTimeout(() => {
            unlockStage(6);
            window.goToStage(6);
        }, 2500);
    }
}

function drawScene(isMagnified) {
    const WORLD_W = canvas.width / BASE_SCALE;
    const WORLD_H = canvas.height / BASE_SCALE;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    
    // Draw Terminal Grid
    ctx.strokeStyle = '#020';
    ctx.lineWidth = 1;
    const gridStep = 100;
    
    for (let i = 0; i <= WORLD_W; i += gridStep) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, WORLD_H); ctx.stroke();
    }
    for (let i = 0; i <= WORLD_H; i += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(WORLD_W, i); ctx.stroke();
    }

    // Draw Ants
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let a of ants) {
        if (a.type === 'carrier' && a.captured) continue;

        const ax = a.rx * WORLD_W;
        const ay = a.ry * WORLD_H;

        if (a.type === 'carrier' || a.type === 'decoy') {
            if (isMagnified) {
                ctx.fillStyle = '#000';
                ctx.fillRect(ax - 20, ay - 20, 40, 40);
                
                // Decoys are red, carriers are green
                ctx.strokeStyle = a.type === 'decoy' ? '#a00' : '#0f0';
                ctx.lineWidth = 2;
                ctx.strokeRect(ax - 20, ay - 20, 40, 40);
                
                ctx.fillStyle = a.type === 'decoy' ? '#a00' : '#0f0';
                ctx.font = '32px monospace';
                ctx.fillText(a.glyph, ax, ay);
            } else {
                ctx.fillStyle = '#0f0';
                ctx.fillRect(ax - 8, ay - 8, 16, 16);
            }
        } else {
            // Normal Ant
            ctx.fillStyle = '#060'; 
            ctx.fillRect(ax - 3, ay - 3, 6, 6);
        }
    }
}

function loop() {
    if (!gameWon && !gamePaused) {
        let speedMult = 1.0;
        let repelActive = false;
        
        if (captured.length === 1) speedMult = 1.2;
        if (captured.length >= 2) {
            speedMult = 1.2;
            repelActive = true;
        }
        if (captured.length === 3) {
            speedMult = 1.2;
            repelActive = true;
        }

        const maxSpeed = 0.001 * speedMult;
        
        for (let a of ants) {
            if (a.type === 'carrier' && a.captured) continue;

            a.vx += (Math.random() - 0.5) * 0.0005 * speedMult;
            a.vy += (Math.random() - 0.5) * 0.0005 * speedMult;
            
            // Fleeing Logic
            if (repelActive && (a.type === 'carrier' || a.type === 'decoy')) {
                const screenX = a.rx * canvas.width;
                const screenY = a.ry * canvas.height;
                const distToMouse = Math.hypot(screenX - mouseX, screenY - mouseY);
                
                if (distToMouse < 250) {
                    const force = (250 - distToMouse) * 0.000015 * speedMult;
                    a.vx += ((screenX - mouseX) / distToMouse) * force * 0.01;
                    a.vy += ((screenY - mouseY) / distToMouse) * force * 0.01;
                }
            }
            
            // Limit Speed
            const speed = Math.hypot(a.vx, a.vy);
            if (speed > maxSpeed) {
                a.vx = (a.vx / speed) * maxSpeed;
                a.vy = (a.vy / speed) * maxSpeed;
            }
            
            a.rx += a.vx;
            a.ry += a.vy;
            
            // Wrap Bounds
            if (a.rx < 0) a.rx += 1;
            if (a.rx > 1) a.rx -= 1;
            if (a.ry < 0) a.ry += 1;
            if (a.ry > 1) a.ry -= 1;
        }
    }

    // 1. Draw Base Layer
    ctx.save();
    ctx.scale(BASE_SCALE, BASE_SCALE);
    drawScene(false);
    ctx.restore();

    // 2. Draw Magnifying Glass
    if (mouseX >= 0 && mouseY >= 0 && !gameWon) {
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 150, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.translate(mouseX, mouseY);
        ctx.scale(zoom, zoom);
        ctx.translate(-mouseX, -mouseY);
        
        ctx.scale(BASE_SCALE, BASE_SCALE);
        
        drawScene(true);
        
        ctx.restore();
        
        // Lens Frame
        const radGrad = ctx.createRadialGradient(mouseX, mouseY, 100, mouseX, mouseY, 150);
        radGrad.addColorStop(0, 'rgba(0, 255, 0, 0)');
        radGrad.addColorStop(1, 'rgba(0, 255, 0, 0.15)');
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 150, 0, Math.PI * 2);
        ctx.fillStyle = radGrad;
        ctx.fill();
        
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(mouseX - 20, mouseY); ctx.lineTo(mouseX + 20, mouseY);
        ctx.moveTo(mouseX, mouseY - 20); ctx.lineTo(mouseX, mouseY + 20);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    animationId = requestAnimationFrame(loop);
}

export function destroy() {
    cancelAnimationFrame(animationId);
    document.removeEventListener('mousemove', boundMousemove);
    document.removeEventListener('wheel', boundWheel);
    document.removeEventListener('click', boundClick);
    document.removeEventListener('keydown', boundKeydown);
    window.removeEventListener('resize', boundResize);
}
