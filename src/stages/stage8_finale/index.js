import { unlockStage } from '../../core/state.js';
import { getGlobalVolume, setGlobalVolume, toggleMusic, forceTrack, getAudioData, initAudioAnalyzer } from '../../core/audio.js';

let scrollHandler;
let animationId;
let mouseMoveHandler;

const mouse = { x: -1000, y: -1000, radius: 150 };

let messages = [
    "Every line of code tells a story.",
    "Sometimes the best memories are written in green terminal text.",
    "Bugs are just undocumented features of our friendship.",
    "A journey measured not in miles, but in git commits.",
    "In a world of noise, some signals stand out clearly.",
    "The most complex algorithms can't parse true connection.",
    "System architectures may fade, but core memories remain intact.",
    "Some variables are constant, no matter the scope.",
    "Navigating the maze was just the beginning of the runtime.",
    "Happy Birthday Bhanu."
];

let stars = [];
const RAMP = ' .:-=+*#%@';
const numStars = 312;
const numSpherePoints = 25;
const spherePoints = [];

for (let i = 0; i < numSpherePoints; i++) {
    const phi = Math.acos(-1 + (2 * i) / numSpherePoints);
    const theta = Math.sqrt(numSpherePoints * Math.PI) * phi;
    spherePoints.push({
        baseX: Math.cos(theta) * Math.sin(phi),
        baseY: Math.sin(theta) * Math.sin(phi),
        baseZ: Math.cos(phi),
        char: RAMP[Math.floor(Math.random() * RAMP.length)]
    });
}

class Pixel {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.color = color;
    this.vx = 0;
    this.vy = 0;
    this.size = 3;
    
    // Add scroll explosion vectors
    const centerX = 600;
    const centerY = 150;
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.hypot(dx, dy) || 1;
    const force = 1000 + Math.random() * 2000;
    this.explodeX = (dx / dist) * force;
    this.explodeY = (dy / dist) * force;
  }
  update(mouseX, mouseY, zDistance) {
    // 1. Mouse shattering
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < mouse.radius) {
      const angle = Math.atan2(dy, dx);
      const force = (mouse.radius - dist) / mouse.radius;
      this.vx -= Math.cos(angle) * force * 20;
      this.vy -= Math.sin(angle) * force * 20;
    }
    
    // Spring physics back to origin
    const targetX = this.originX;
    const targetY = this.originY;
    
    this.vx += (targetX - this.x) * 0.08;
    this.vy += (targetY - this.y) * 0.08;
    this.vx *= 0.85;
    this.vy *= 0.85;
    this.x += this.vx;
    this.y += this.vy;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

export async function init() {
    try {
        let response = await fetch('/public/messages.json');
        if (!response.ok) {
            response = await fetch('/public/messages.json');
        }
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                messages = data;
            }
        }
    } catch (e) {
        console.warn("[Stage 8] Failed to load messages.json, using static fallback:", e);
    }

    const app = document.getElementById('app');
    
    document.documentElement.style.height = 'auto';
    document.documentElement.style.overflow = 'visible';
    document.body.style.height = '45000px'; 
    document.body.style.overflow = 'visible';
    if (app) {
        app.style.height = 'auto';
        app.style.overflow = 'visible';
    }

    app.innerHTML = '<style>.viewport { position: fixed; inset: 0; perspective: 1000px; overflow: hidden; background: #000a03; } .world { position: absolute; top: 50%; left: 50%; transform-style: preserve-3d; } .ascii-layer { position: absolute; display: flex; justify-content: center; align-items: center; } canvas { display: block; width: 100%; height: 100%; } .photo-canvas { filter: contrast(1.2) brightness(1.1) drop-shadow(0 0 2px rgba(0,255,0,0.5)); } .message-canvas { filter: drop-shadow(0 0 8px #0f0); } #finale-loader { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #0f0; font-family: monospace; font-size: 24px; z-index: 9999; text-shadow: 0 0 10px #0f0; }</style><div id="finale-loader">INITIALIZING CORE SEQUENCE...</div><div class="viewport"><div id="finale-world" class="world"></div></div><div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center;"><h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 8 INSTRUCTIONS</h2><p style="font-size: 18px; margin-bottom: 10px;">Welcome to the finale.</p><p style="font-size: 18px; margin-bottom: 10px;">Please have music turn on this Stage and</p><p style="font-size: 18px; margin-bottom: 30px;">Scroll down to navigate throught the chamber.</p><p style="font-size: 14px; opacity: 0.7;">Press H to resume.</p><p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p><div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;"><label for="vol-slider-finale" style="font-size: 14px;">Music Volume</label><input type="range" id="vol-slider-finale" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;"><div style="display: flex; gap: 10px; margin-top: 10px;"><button id="btn-toggle-music-finale" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button><button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button></div></div></div>';


    window.scrollTo(0, 0);

    // Force the background music to the custom track
    forceTrack('/music/Malcolm Todd - Earrings.mp3');

    // Initialize the audio analyzer for stars
    initAudioAnalyzer();

    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            // Push stars further apart by increasing X and Y spread
            x: (Math.random() - 0.5) * 12000,
            y: (Math.random() - 0.5) * 8000,
            z: Math.random() * -50000 + 5000,
            char: RAMP[Math.floor(Math.random() * RAMP.length)],
            offset: Math.random() * 100
        });
    }

    // Create the stars canvas layer behind the world but inside the viewport
    const viewport = document.querySelector('.viewport');
    const starsCanvas = document.createElement('canvas');
    starsCanvas.id = 'stars-canvas';
    starsCanvas.style.position = 'absolute';
    starsCanvas.style.inset = '0';
    starsCanvas.style.width = '100%';
    starsCanvas.style.height = '100%';
    starsCanvas.style.pointerEvents = 'none';
    starsCanvas.style.zIndex = '0'; // Behind the world
    viewport.insertBefore(starsCanvas, document.getElementById('finale-world'));

    let gamePaused = false;
    let boundKeydown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 'h') {
            gamePaused = !gamePaused;
            document.getElementById('instruction-popup').style.display = gamePaused ? 'flex' : 'none';
            if (gamePaused) {
                const slider = document.getElementById('vol-slider-finale');
                if (slider) slider.value = getGlobalVolume();
            }
        }
    };
    document.addEventListener('keydown', boundKeydown);
    window._stage8Keydown = boundKeydown;
    
    const volSlider = document.getElementById('vol-slider-finale');
    if (volSlider) {
        volSlider.addEventListener('input', (ev) => {
            setGlobalVolume(parseFloat(ev.target.value));
        });
    }

    const btnToggle = document.getElementById('btn-toggle-music-finale');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleMusic();
        });
    }

    mouseMoveHandler = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', mouseMoveHandler);

    const mediaFiles = [
        new URL('../../assets/photos/bhanu_girotra_20260814_125140_087.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125143_671.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125144_331.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125200_950.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125205_036.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125205_615.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125210_259.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125214_352.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125214_549.jpg', import.meta.url).href,
        new URL('../../assets/photos/bhanu_girotra_20260814_125342_738.jpg', import.meta.url).href
    ];

    const world = document.getElementById('finale-world');
    const loader = document.getElementById('finale-loader');
    const messageCanvases = [];
    let itemsProcessed = 0;
    const totalItems = mediaFiles.length;

    mediaFiles.forEach((file, index) => {
        const spreadX = (index % 2 === 0 ? 1 : -1) * (200 + Math.random() * 200);
        const spreadY = (index % 3 === 0 ? 1 : -1) * (100 + Math.random() * 100);
        const zPosPhoto = -index * 4500;
        
        const layerDiv = document.createElement('div');
        layerDiv.className = 'ascii-layer';
        layerDiv.style.transform = 'translate3d(' + spreadX + 'px, ' + spreadY + 'px, ' + zPosPhoto + 'px)';
        world.appendChild(layerDiv);

        const canvas = document.createElement('canvas');
        canvas.className = 'photo-canvas';
        layerDiv.appendChild(canvas);

        const media = new Image();
        const layerObj = {
            media: media,
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            offCanvas: document.createElement('canvas'),
            offCtx: null
        };
        layerObj.offCtx = layerObj.offCanvas.getContext('2d', { willReadFrequently: true });

        const onReady = () => {
            const aspect = media.height / media.width;
            const cardWidth = 600;
            const cardHeight = Math.floor(cardWidth * aspect);
            
            layerDiv.style.width = cardWidth + 'px';
            layerDiv.style.height = cardHeight + 'px';
            layerDiv.style.marginLeft = '-' + (cardWidth / 2) + 'px';
            layerDiv.style.marginTop = '-' + (cardHeight / 2) + 'px';

            renderLayer(layerObj);
            
            itemsProcessed++;
            loader.innerText = 'PROCESSING ASCII (' + itemsProcessed + '/' + totalItems + ')';
            
            if (itemsProcessed === totalItems) {
                setTimeout(() => { loader.style.display = 'none'; }, 500);
            }
        };

        media.onload = onReady;
        media.onerror = (e) => {
            itemsProcessed++;
            if (itemsProcessed === totalItems) {
                setTimeout(() => { loader.style.display = 'none'; }, 500);
            }
        };
        
        media.src = file;

        if (messages[index]) {
            const zPosMsg = zPosPhoto - 2250;
            const msgSpreadX = (index % 2 === 0 ? -1 : 1) * (50 + Math.random() * 150);
            const msgSpreadY = (index % 3 === 0 ? -1 : 1) * (20 + Math.random() * 80);

            const msgDiv = document.createElement('div');
            msgDiv.className = 'ascii-layer';
            msgDiv.style.transform = 'translate3d(' + msgSpreadX + 'px, ' + msgSpreadY + 'px, ' + zPosMsg + 'px)';
            
            const mWidth = 1200;
            const mHeight = 300;
            msgDiv.style.width = mWidth + 'px';
            msgDiv.style.height = mHeight + 'px';
            msgDiv.style.marginLeft = '-' + (mWidth / 2) + 'px';
            msgDiv.style.marginTop = '-' + (mHeight / 2) + 'px';
            world.appendChild(msgDiv);

            const mCanvas = document.createElement('canvas');
            mCanvas.className = 'message-canvas';
            mCanvas.width = mWidth;
            mCanvas.height = mHeight;
            msgDiv.appendChild(mCanvas);
            const mCtx = mCanvas.getContext('2d');

            const offMsg = document.createElement('canvas');
            offMsg.width = mWidth;
            offMsg.height = mHeight;
            const offMsgCtx = offMsg.getContext('2d', { willReadFrequently: true });
            
            // Text rendering with word wrap simulation (2 lines max assumed for 1200px width)
            offMsgCtx.font = 'bold 42px "Courier New", monospace';
            offMsgCtx.fillStyle = '#ffffff';
            offMsgCtx.textAlign = 'center';
            offMsgCtx.textBaseline = 'middle';
            
            const text = messages[index];
            if (offMsgCtx.measureText(text).width > mWidth - 100) {
                // Split string roughly in half
                const mid = Math.floor(text.length / 2);
                let splitIdx = text.indexOf(' ', mid);
                if (splitIdx === -1) splitIdx = mid;
                const line1 = text.substring(0, splitIdx);
                const line2 = text.substring(splitIdx + 1);
                offMsgCtx.fillText(line1, mWidth / 2, mHeight / 2 - 25);
                offMsgCtx.fillText(line2, mWidth / 2, mHeight / 2 + 25);
            } else {
                offMsgCtx.fillText(text, mWidth / 2, mHeight / 2);
            }

            const imgD = offMsgCtx.getImageData(0, 0, mWidth, mHeight).data;
            const pixels = [];
            // Sample every 3 pixels for a dense but performant array
            for (let y = 0; y < mHeight; y += 3) {
                for (let x = 0; x < mWidth; x += 3) {
                    const idx = (y * mWidth + x) * 4;
                    if (imgD[idx + 3] > 128) {
                        pixels.push(new Pixel(x, y, '#0f0'));
                    }
                }
            }
            messageCanvases.push({ canvas: mCanvas, ctx: mCtx, pixels: pixels, div: msgDiv, z: zPosMsg, width: mWidth, height: mHeight });
        }
    });

    const asciiChars = ' .\\' + '\`^",:;Il!i><~+_-?][}{1)(|\\\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

    function renderLayer(layer) {
        const cols = 200;
        const rows = Math.floor(cols * (layer.media.height / layer.media.width) * 0.55);

        layer.offCanvas.width = cols;
        layer.offCanvas.height = rows;

        try { layer.offCtx.drawImage(layer.media, 0, 0, cols, rows); } catch(e) { return; }

        let imgData;
        try { imgData = layer.offCtx.getImageData(0, 0, cols, rows).data; } catch(e) { return; }

        const fontSize = 600 / cols;
        const charWidth = fontSize * 0.6;
        const charHeight = fontSize;

        layer.canvas.width = cols * charWidth;
        layer.canvas.height = rows * charHeight;

        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        layer.ctx.font = 'bold ' + fontSize + 'px "Courier New", monospace';
        layer.ctx.textBaseline = 'top';
        
        const darkGreen = [];
        const brightGreen = [];
        const white = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const idx = (y * cols + x) * 4;
                const r = imgData[idx];
                const g = imgData[idx+1];
                const b = imgData[idx+2];
                const brightness = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
                const charIdx = Math.floor(brightness * (asciiChars.length - 1));
                const char = asciiChars[charIdx];

                if (char !== ' ') {
                    const item = { char: char, x: x * charWidth, y: y * charHeight };
                    if (brightness < 0.4) darkGreen.push(item);
                    else if (brightness < 0.7) brightGreen.push(item);
                    else white.push(item);
                }
            }
        }
        
        layer.ctx.shadowBlur = 4;
        layer.ctx.shadowColor = '#0f0';
        layer.ctx.fillStyle = '#008800';
        for(let i=0; i<darkGreen.length; i++) layer.ctx.fillText(darkGreen[i].char, darkGreen[i].x, darkGreen[i].y);
        
        layer.ctx.shadowBlur = 8;
        layer.ctx.shadowColor = '#0f0';
        layer.ctx.fillStyle = '#33ff33';
        for(let i=0; i<brightGreen.length; i++) layer.ctx.fillText(brightGreen[i].char, brightGreen[i].x, brightGreen[i].y);
        
        layer.ctx.shadowBlur = 15;
        layer.ctx.shadowColor = '#fff';
        layer.ctx.fillStyle = '#ffffff';
        for(let i=0; i<white.length; i++) layer.ctx.fillText(white[i].char, white[i].x, white[i].y);
        
        // Reset shadow for the blur mask below
        layer.ctx.shadowBlur = 0;
        
        layer.ctx.globalCompositeOperation = 'destination-in';
        layer.ctx.filter = 'blur(12px)';
        layer.ctx.fillStyle = '#000';
        layer.ctx.beginPath();
        layer.ctx.roundRect(10, 10, layer.canvas.width - 20, layer.canvas.height - 20, 40);
        layer.ctx.fill();
        layer.ctx.globalCompositeOperation = 'source-over';
        layer.ctx.filter = 'none';
    }

    let targetZ = 0;
    let currentZ = 0;

    scrollHandler = () => {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        targetZ = progress * 43500;
    };
    window.addEventListener('scroll', scrollHandler);

    function animate() {
        currentZ += (targetZ - currentZ) * 0.08;
        
        let currentProgress = targetZ > 0 ? currentZ / 43500 : 0;
        let totalSLoops = 3;
        let xAmplitude = 550;
        let camAngle = currentProgress * Math.PI * 2 * totalSLoops;
        let camX = -Math.sin(camAngle) * xAmplitude;

        if (world) {
            world.style.transform = `translate3d(${camX}px, 0px, ${currentZ}px)`;
        }

        for(let m = 0; m < messageCanvases.length; m++) {
            const mc = messageCanvases[m];
            const zDistance = currentZ + mc.z;
            
            if (zDistance > -1500 && zDistance < 3000) {
                const rect = mc.canvas.getBoundingClientRect();
                const scale = rect.width / mc.canvas.width;
                const localMouseX = (mouse.x - rect.left) / scale;
                const localMouseY = (mouse.y - rect.top) / scale;
                
                if (scale > 0.01) {
                    mc.ctx.clearRect(0, 0, mc.width, mc.height);
                    for(let i=0; i<mc.pixels.length; i++) {
                        const p = mc.pixels[i];
                        p.update(localMouseX, localMouseY, zDistance);
                        p.draw(mc.ctx);
                    }
                }
                mc.cleared = false;
            } else {
                if (!mc.cleared) {
                     mc.ctx.clearRect(0, 0, mc.width, mc.height);
                     mc.cleared = true;
                }
            }
        }

        const sCanvas = document.getElementById('stars-canvas');
        if (sCanvas) {
            sCanvas.width = window.innerWidth;
            sCanvas.height = window.innerHeight;
            const sCtx = sCanvas.getContext('2d');
            sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);

            const audioData = getAudioData();
            const energy = audioData.energy;
            const freqData = audioData.dataArray;

            const fov = 400;
            const cx = sCanvas.width / 2;
            const cy = sCanvas.height / 2;

            const renderedStars = [];

            let time = Date.now() * 0.001;

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                let freqDisplacement = 0;
                
                if (freqData && freqData.length > 0) {
                    const bin = (i + Math.floor(s.offset)) % freqData.length;
                    freqDisplacement = (freqData[bin] / 255) * 150; // Increased sensitivity
                }

                // S-curve camera offsets
                const relativeZ = s.z + currentZ;
                
                // Z increases towards viewer. Render if in front of camera (relativeZ < fov) and not too far.
                if (relativeZ > -15000 && relativeZ < fov - 10) {
                    const scale = fov / (fov - relativeZ);

                    let angleY = time * 0.5 + s.offset;
                    let angleX = time * 0.3 + s.offset;
                    
                    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
                    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);

                    const r = 30 + freqDisplacement; // Smaller base radius

                    for (let j = 0; j < spherePoints.length; j++) {
                        const sp = spherePoints[j];
                        
                        let px3 = sp.baseX * r;
                        let py3 = sp.baseY * r;
                        let pz3 = sp.baseZ * r;

                        let rx = px3 * cosY - pz3 * sinY;
                        let rz = px3 * sinY + pz3 * cosY;

                        let ry = py3 * cosX - rz * sinX;
                        rz = py3 * sinX + rz * cosX;

                        // Project base star position + local sphere point offset
                        const px = cx + (s.x + camX + rx) * scale;
                        const py = cy + (s.y + ry) * scale;
                        
                        renderedStars.push({
                            x: px, y: py, z: relativeZ + rz, scale: scale, char: sp.char, energy: energy, pulse: freqDisplacement
                        });
                    }
                }
            }

            renderedStars.sort((a, b) => b.z - a.z);

            sCtx.textAlign = 'center';
            sCtx.textBaseline = 'middle';
            for (let i = 0; i < renderedStars.length; i++) {
                const rs = renderedStars[i];
                const fontSize = Math.max(8, Math.floor(18 * rs.scale));
                sCtx.font = `bold ${fontSize}px "Courier New", monospace`;

                if (rs.z < 1000 && rs.pulse > 60) {
                    sCtx.fillStyle = '#ffffff'; // audio spike flare
                    sCtx.shadowBlur = 10;
                    sCtx.shadowColor = '#0f0';
                } else if (rs.z < 3000) {
                    sCtx.fillStyle = '#00ff66'; // bright green
                    sCtx.shadowBlur = 5;
                    sCtx.shadowColor = '#00ff66';
                } else {
                    sCtx.fillStyle = '#003311'; // deep background
                    sCtx.shadowBlur = 0;
                }

                sCtx.fillText(rs.char, rs.x, rs.y);
            }
        }

        animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);
}

export function destroy() {
    if (scrollHandler) { window.removeEventListener('scroll', scrollHandler); scrollHandler = null; }
    if (mouseMoveHandler) { window.removeEventListener('mousemove', mouseMoveHandler); mouseMoveHandler = null; }
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (window._stage8Keydown) { document.removeEventListener('keydown', window._stage8Keydown); delete window._stage8Keydown; }
    
    document.body.style.height = '';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '';
    document.documentElement.style.overflow = '';
    const app = document.getElementById('app');
    if (app) { app.style.height = '100vh'; app.style.overflow = ''; }
}

