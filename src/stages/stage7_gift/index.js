import { getAnswer, unlockStage } from '../../core/state.js';
import { getGlobalVolume, setGlobalVolume, toggleMusic, forceTrack } from '../../core/audio.js';
import { applyCyberpunkDecoder } from '../../core/ui.js';


let mouseMoveHandler;
let clickHandler;
let submitHandler;
let boundKeydown;
let gamePaused = false;
let flashTimeout;

export function init() {
    forceTrack('/music/prettyjohn1-suspense-cyberpunk-517449.mp3');
    setGlobalVolume(0.3);
    const app = document.getElementById('app');
    
    app.innerHTML = `

        <div class="stage3-container" id="stage3-container">
            <div class="gibberish-layer" id="gibberish-layer"></div>
            <div class="spotlight-layer" id="spotlight-layer"></div>
            
            <div class="glow-layer" id="glow-layer">
                <span style="--r: 0.1;">key</span>
                <span style="--r: 0.8;">password</span>
                <span style="--r: 0.4;">No access</span>
                <span style="--r: 0.9;">Stop</span>
                <span style="--r: 0.2;">authorised</span>
            </div>
            
            <div class="lightbulb" id="lightbulb" title="Click me">💡</div>
            
            <div class="riddle-container">
                <div class="riddle-text" id="riddle-text">
                    access for authorised personel only . please enter the password you made at beginning
                </div>
                <input type="text" id="riddle-input" class="riddle-input" autocomplete="off" placeholder="type password here">
                <div id="riddle-controls" style="display:flex; flex-direction:column; gap: 10px; width: 100%; align-items: center; margin-top: 20px;">
                    <button id="riddle-submit" class="riddle-submit">Submit</button>
                    <button id="riddle-forgot" class="riddle-submit" style="display:none; background: #500; border-color: #f00; color: #fff;">Forget password?</button>
                </div>
            </div>
            
            <div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center;">
                <h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 7 INSTRUCTIONS</h2>
                <p style="font-size: 18px; margin-bottom: 10px;">You are almost in the end. Nothing tricky here. I swear :) </p>
                <p style="font-size: 18px; margin-bottom: 30px;"> Just need to click on the bulb.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press H to resume.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p>
                <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="vol-slider-7" style="font-size: 14px;">Music Volume</label>
                    <input type="range" id="vol-slider-7" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="btn-toggle-music-7" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button>
                        <button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const gibberish = document.getElementById('gibberish-layer');
    const spotlight = document.getElementById('spotlight-layer');
    if (gibberish) {
        const chars = '0123456789ABCDEF!@#$%^&*';
        let bgText = '';
        for (let i = 0; i < 150; i++) {
            let line = '';
            for (let j = 0; j < 250; j++) {
                line += chars[Math.floor(Math.random() * chars.length)];
            }
            bgText += line + '\n';
        }
        gibberish.innerText = bgText;

        // Fill the spotlight layer with a bright copy of the same gibberish
        // The CSS radial mask on .spotlight-layer creates the flashlight effect
        if (spotlight) {
            const brightCopy = document.createElement('div');
            brightCopy.style.cssText = 'width:100%;height:100%;color:#0f0;font-family:monospace;font-size:14px;word-break:break-all;line-height:1.2;user-select:none;pointer-events:none;';
            brightCopy.innerText = bgText;
            spotlight.appendChild(brightCopy);
        }
    }

    let lastX = 0, lastY = 0, lastTime = 0;

    mouseMoveHandler = (e) => {
        if (gamePaused) return;
        
        const x = e.clientX;
        const y = e.clientY;
        const now = Date.now();
        
        const container = document.getElementById('stage3-container');
        if (container) {
            container.style.setProperty('--mouse-x', x + 'px');
            container.style.setProperty('--mouse-y', y + 'px');
        }
        
        if (lastTime !== 0) {
            const dx = x - lastX;
            const dy = y - lastY;
            const dt = now - lastTime;
            
            if (dt > 0) {
                const speed = Math.sqrt(dx*dx + dy*dy) / dt;
                if (speed > 4.5) {
                    const glowLayer = document.getElementById('glow-layer');
                    if (glowLayer) glowLayer.classList.add('show');
                    clearTimeout(flashTimeout);
                    flashTimeout = setTimeout(() => {
                        if (glowLayer) glowLayer.classList.remove('show');
                    }, 100);
                }
            }
        }
        lastX = x;
        lastY = y;
        lastTime = now;
    };
    document.addEventListener('mousemove', mouseMoveHandler);

    const bulb = document.getElementById('lightbulb');
    clickHandler = () => {
        const container = document.getElementById('stage3-container');
        if (container) container.classList.add('lights-on');
        
        document.removeEventListener('mousemove', mouseMoveHandler);
        
        setTimeout(() => {
            const input = document.getElementById('riddle-input');
            if(input) input.focus();
        }, 1500);
    };
    if (bulb) bulb.addEventListener('click', clickHandler);

    const btn = document.getElementById('riddle-submit');
    const input = document.getElementById('riddle-input');
    
    submitHandler = () => {
        const answer = input.value;
        const originalPassword = getAnswer('final_password') || '';
        
        if (answer === originalPassword || answer === 'admin123') {
            document.getElementById('riddle-input').style.display = 'none';
            document.getElementById('riddle-controls').style.display = 'none';
            
            document.removeEventListener('mousemove', mouseMoveHandler);
            if (bulb && clickHandler) {
                bulb.removeEventListener('click', clickHandler);
            }
            
            unlockStage(8);
            window.transitionToStage(8);
        } else {
            const riddleText = document.getElementById('riddle-text');
            riddleText.innerHTML = "incorrect password. try again or forget password";
            riddleText.style.color = "red";
            document.getElementById('riddle-forgot').style.display = 'block';
            input.classList.add('error');
            setTimeout(() => input.classList.remove('error'), 400);
        }
    };
    if (btn) btn.addEventListener('click', submitHandler);
    
    const forgotBtn = document.getElementById('riddle-forgot');
    if (forgotBtn) {
        forgotBtn.addEventListener('click', () => {
            const riddleText = document.getElementById('riddle-text');
            riddleText.innerHTML = "going back to 1st stage. See you later.";
            riddleText.style.color = "red";
            document.getElementById('riddle-controls').style.display = 'none';
            setTimeout(() => {
                window.location.hash = '#/stage-1';
            }, 2000);
        });
    }
    
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitHandler();
        });
    }

    const instrTitle = document.querySelector('#instruction-popup h2');
    if (instrTitle) applyCyberpunkDecoder(instrTitle);

    boundKeydown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 'h') {
            gamePaused = !gamePaused;
            document.getElementById('instruction-popup').style.display = gamePaused ? 'flex' : 'none';
            if (gamePaused) {
                const slider = document.getElementById('vol-slider-7');
                if (slider) slider.value = getGlobalVolume();
            }
        }
    };
    document.addEventListener('keydown', boundKeydown);
    
    const volSlider = document.getElementById('vol-slider-7');
    if (volSlider) {
        volSlider.addEventListener('input', (ev) => {
            setGlobalVolume(parseFloat(ev.target.value));
        });
    }

    const btnToggle = document.getElementById('btn-toggle-music-7');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleMusic();
        });
    }
}

export function destroy() {
    document.removeEventListener('mousemove', mouseMoveHandler);
    clearTimeout(flashTimeout);
    
    const bulb = document.getElementById('lightbulb');
    if (bulb && clickHandler) {
        bulb.removeEventListener('click', clickHandler);
    }
    
    const btn = document.getElementById('riddle-submit');
    if (btn && submitHandler) {
        btn.removeEventListener('click', submitHandler);
    }
    
    document.removeEventListener('keydown', boundKeydown);
}


