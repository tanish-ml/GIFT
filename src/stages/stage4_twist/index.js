import { unlockStage, isDevModeActive } from '../../core/state.js';
import { getGlobalVolume, setGlobalVolume, toggleMusic, forceTrack } from '../../core/audio.js';
import { applyCyberpunkDecoder } from '../../core/ui.js';

let appContainer;
let audioCtx;
let gameActive = false;
let gameWon = false;
let nodes = [];
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let pingTimer = null;
let dist = 2000;
let nearestNode = null;
let gamePaused = false;
let boundMousemove, boundClick, boundStart, boundKeydown;

const trapLinks = [
    'https://puginarug.com/',
    'https://www.window-swap.com/Window',
    'https://radio.garden/visit/pratapgarh/UjVL530T',
    'http://weavesilk.com/',
    'https://www.nytimes.com/games/wordle/index.html',
    'https://paint.toys/symmetry/',
    'https://jacksonpollock.org/',
    'https://hackertyper.net/',
    'https://littlealchemy2.com/',
    'https://optical.toys/',
    'https://www.bored.com/cool-websites/',
    'https://neal.fun/',
    'https://neal.fun/life-stats/',
    'https://neal.fun/size-of-space/',
    'https://neal.fun/dark-patterns/',
    'https://neal.fun/asteroid-launcher/',
    'https://neal.fun/lets-settle-this/',
    'https://neal.fun/ambient-chaos/',
    'https://neal.fun/stimulation-clicker/'
];

export function init() {
    forceTrack('/music/monume-cyberpunk-519219.mp3');
    setGlobalVolume(0.5);
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="stage4-container" id="stage4-container">
            <div class="audio-overlay" id="audio-overlay">
                <h2>STAGE 4: THE BLIND HACKER</h2>
                <p style="margin-bottom: 20px; font-size: 16px;">This challenge requires audio. Pinpoint the hidden data node using sonar.</p>
                <p style="margin-bottom: 40px; font-size: 16px; color:#a00;">WARNING: Multiple corrupted signals detected.</p>
                <button class="btn-start-audio" id="btn-start">ENABLE AUDIO SCANNERS</button>
            </div>
            
            <div class="win-overlay" id="win-overlay">
                <h1>NODE EXTRACTED</h1>
                <p>DECRYPTION KEY ACQUIRED</p>
                <p>Redirecting to Stage 5...</p>
            </div>
            
            <div class="ui-tracker">
                <div class="radar-sweep"></div>
                STATUS: SCANNING...
            </div>
            
            <div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center;">
                <h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 4 INSTRUCTIONS</h2>
                <p style="font-size: 18px; margin-bottom: 10px;">You are blind. Use the audio sonar to locate the data node.</p>
                <p style="font-size: 18px; margin-bottom: 30px;">The node emits a high-pitched, clean sine wave. Click when the true signal is loudest.</p>
                   <p style="font-size: 18px; margin-bottom: 10px;">Use mouse to find where the pitch is correct. It is advised to move your mouse slowly.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press 'H' to resume.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p>
                <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="vol-slider-4" style="font-size: 14px;">Music Volume</label>
                    <input type="range" id="vol-slider-4" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="btn-toggle-music-4" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button>
                        <button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    appContainer = document.getElementById('stage4-container');

    // Duck global background music so we can hear the sonar
    setGlobalVolume(0.15);

    gamePaused = false;
    
    // Reset nodes on init
    nodes = [];

    // Spawn 1 True Node and 2 Decoy Nodes
    const spawnPadding = 100;
    const w = window.innerWidth - spawnPadding * 2;
    const h = window.innerHeight - spawnPadding * 2;

    nodes.push({
        x: spawnPadding + Math.random() * w,
        y: spawnPadding + Math.random() * h,
        type: 'true'
    });


    if (isDevModeActive()) {
        for (let n of nodes) {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.left = n.x + 'px';
            el.style.top = n.y + 'px';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.borderRadius = '50%';
            el.style.pointerEvents = 'none'; // Don't block clicks
            if (n.type === 'true') {
                el.style.background = '#0f0';
                el.style.boxShadow = '0 0 20px #0f0';
            } else {
                el.style.background = '#f00';
                el.style.boxShadow = '0 0 20px #f00';
            }
            appContainer.appendChild(el);
        }
    }

    boundStart = () => {
        document.getElementById('audio-overlay').style.display = 'none';
        startGame();
    };
    document.getElementById('btn-start').addEventListener('click', boundStart);

    boundMousemove = (e) => {
        if (!gameActive || gamePaused) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
        updateDistance();
    };

    boundClick = (e) => {
        if (!gameActive || gamePaused || e.target.tagName === 'BUTTON') return;
        
        // Check if we clicked within 80 pixels of a node (increased hit radius)
        for (let n of nodes) {
            const d = Math.hypot(n.x - mouseX, n.y - mouseY);
            if (d < 80) {
                if (n.type === 'true') {
                    triggerWin();
                } else {
                    triggerTrap();
                }
                return;
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
                const slider = document.getElementById('vol-slider-4');
                if (slider) slider.value = getGlobalVolume();
                
                clearTimeout(pingTimer);
                if (audioCtx && audioCtx.state === 'running') {
                    audioCtx.suspend();
                }
            } else {
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                if (gameActive) schedulePing();
            }
        }
    };

    document.addEventListener('mousemove', boundMousemove);
    document.addEventListener('click', boundClick);
    document.addEventListener('keydown', boundKeydown);
    
    const volSlider = document.getElementById('vol-slider-4');
    if (volSlider) {
        volSlider.addEventListener('input', (ev) => {
            setGlobalVolume(parseFloat(ev.target.value));
        });
    }

    const btnToggle = document.getElementById('btn-toggle-music-4');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleMusic();
        });
    }
}

function startGame() {
    // Initialize Web Audio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    gameActive = true;
    updateDistance(); // Initial check
    schedulePing();
}

function updateDistance() {
    // Find nearest node
    let minDist = Infinity;
    let closest = null;
    for (let n of nodes) {
        const d = Math.hypot(n.x - mouseX, n.y - mouseY);
        if (d < minDist) {
            minDist = d;
            closest = n;
        }
    }
    
    dist = minDist;
    nearestNode = closest;

    // Visual Glitch if extremely close
    if (dist < 80) {
        appContainer.classList.add('glitching');
    } else {
        appContainer.classList.remove('glitching');
    }
}

function schedulePing() {
    if (!gameActive) return;

    if (nearestNode) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        // True = Clean Sine (High Pitch), Decoy = Corrupted Square (Low Pitch)
        if (nearestNode.type === 'true') {
            osc.type = 'sine';
            osc.frequency.value = 400 + Math.max(0, 800 - dist);
        } else {
            osc.type = 'square';
            osc.frequency.value = 100 + Math.max(0, 300 - (dist * 0.5));
        }
        
        // Volume scales up as you get closer
        const vol = Math.max(0.1, 1.0 - (dist / 1000));
        
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }
    
    // Delay: 1000ms far away, down to 40ms up close
    const delay = Math.max(40, Math.min(1000, dist));
    pingTimer = setTimeout(schedulePing, delay);
}

function triggerTrap() {
    gameActive = false;
    clearTimeout(pingTimer);
    if (audioCtx) audioCtx.close();
    
    // Play a harsh buzzer sound using browser Audio API if possible before redirect?
    // Eject to trap!
    const randomTrap = trapLinks[Math.floor(Math.random() * trapLinks.length)];
    window.location.href = randomTrap;
}

function triggerWin() {
    gameActive = false;
    gameWon = true;
    clearTimeout(pingTimer);
    if (audioCtx) audioCtx.close();
    
    appContainer.classList.remove('glitching');
    document.getElementById('win-overlay').style.display = 'flex';
    
    setTimeout(() => {
        unlockStage(5);
        window.transitionToStage(5);
    }, 2000);
}

export function destroy() {
    gameActive = false;
    
    // Restore global music volume
    setGlobalVolume(1.0);
    
    clearTimeout(pingTimer);
    if (audioCtx) {
        audioCtx.close();
    }
    document.removeEventListener('mousemove', boundMousemove);
    document.removeEventListener('click', boundClick);
    document.removeEventListener('keydown', boundKeydown);
}



