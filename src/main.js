
import { checkDevice } from './core/deviceGuard.js';
import { initRouter, routeGuard } from './core/router.js?v=130';
import { toggleDevMode, isDevModeActive, unlockStage } from './core/state.js';
import { initGlobalAudio } from './core/audio.js';
import { initCursor } from './core/cursor.js';

try {
    checkDevice();
} catch (e) {
    console.warn(e.message);
}

initRouter();
initGlobalAudio();
initCursor();

window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        window.toggleFullscreen();
        return;
    }
    if (e.shiftKey && e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const hash = window.location.hash || '#/stage-1';
        const match = hash.match(/stage-(\d+)/);
        if (match) {
            let currentStage = parseInt(match[1]);
            if (currentStage < 8) {
                let nextStage = currentStage + 1;
                unlockStage(nextStage);
                if (window.transitionToStage) {
                    window.transitionToStage(nextStage);
                } else {
                    window.location.hash = '#/stage-' + nextStage;
                }
            }
        }
        return;
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        const active = toggleDevMode();
        updateDevOverlay(active);
    }
});

function updateDevOverlay(active) {
    let overlay = document.getElementById('dev-mode-overlay');
    
    if (active) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dev-mode-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                background: rgba(0, 0, 0, 0.9);
                color: #0ff;
                padding: 10px;
                font-family: monospace;
                border-bottom: 1px solid #0ff;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            `;
            
            overlay.innerHTML = `
                <strong>[ DEV MODE ]</strong>
                <a href="#/stage-1" style="color: #0f0; text-decoration: none;">Stage 1</a> |
                <a href="#/stage-2" style="color: #0f0; text-decoration: none;">Stage 2</a> |
                <a href="#/stage-3" style="color: #0f0; text-decoration: none;">Stage 3</a> |
                <a href="#/stage-4" style="color: #0f0; text-decoration: none;">Stage 4</a> |
                <a href="#/stage-5" style="color: #0f0; text-decoration: none;">Stage 5</a> |
                <a href="#/stage-6" style="color: #0f0; text-decoration: none;">Stage 6</a> |
                <a href="#/stage-7" style="color: #0f0; text-decoration: none;">Stage 7</a> |
                <a href="#/stage-8" style="color: #0f0; text-decoration: none;">Stage 8</a> |
                <a href="#/stage-9" style="color: #0f0; text-decoration: none;">Stage 9 (Trial)</a>
            `;
            document.body.appendChild(overlay);
        }
    } else {
        if (overlay) {
            overlay.remove();
        }
    }
}

if (isDevModeActive()) {
    updateDevOverlay(true);
}
// Global Welcome Popup
function showWelcomePopup() {
    if (sessionStorage.getItem('welcomeShown')) return;

    const popup = document.createElement('div');
    popup.id = 'global-welcome-popup';
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.95); z-index: 99999;
        display: flex; justify-content: center; align-items: center;
        flex-direction: column; color: #0f0; font-family: monospace;
        padding: 20px; text-align: center;
    `;

    popup.innerHTML = `
        <h1 style="font-size: 36px; margin-bottom: 20px; text-shadow: 0 0 15px #0f0;">SYSTEM INITIALIZATION</h1>
        <div style="font-size: 18px; max-width: 650px; line-height: 1.8; text-align: left; background: #050505; padding: 30px; border: 2px solid #0f0; border-radius: 8px; box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);">
            <p style="margin-bottom: 15px;">> The whole game needs to be solved to get to the message.</p>
            <p style="margin-bottom: 15px;">> The game only holds in session memory, so any information or password set will not be present in the next session.</p>
            <p style="margin-bottom: 15px;">> For the best experience, we need you to go full screen.</p>
            <p style="margin-bottom: 15px;">> You can press <strong style="color: #fff; background: #333; padding: 2px 6px; border-radius: 4px;">H</strong> to get instructions of the current stage.</p>
            <p>> Please ignore any bugs if you find any :)</p>
        </div>
        <button id="btn-welcome-continue" style="margin-top: 40px; padding: 15px 40px; font-size: 22px; background: transparent; color: #0f0; border: 2px solid #0f0; cursor: pointer; font-family: monospace; font-weight: bold; text-shadow: 0 0 10px #0f0; box-shadow: 0 0 15px rgba(0,255,0,0.5); border-radius: 5px; transition: all 0.3s ease;">CONTINUE</button>
    `;

    document.body.appendChild(popup);

    const btn = document.getElementById('btn-welcome-continue');
    btn.addEventListener('mouseover', () => {
        btn.style.background = '#0f0';
        btn.style.color = '#000';
    });
    btn.addEventListener('mouseout', () => {
        btn.style.background = 'transparent';
        btn.style.color = '#0f0';
    });

    btn.addEventListener('click', () => {
        sessionStorage.setItem('welcomeShown', 'true');
        popup.remove();
        
        // Request Fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn("Fullscreen request denied or not supported:", err);
            });
        }
    });
}
showWelcomePopup();
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
window.toggleFullscreen = toggleFullscreen;








