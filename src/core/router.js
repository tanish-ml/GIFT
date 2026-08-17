import { getHighestUnlockedStage, isDevModeActive } from './state.js';

const routes = {
    'stage-1': () => import('../stages/stage1_login/index.js'),
    'stage-2': () => import('../stages/stage2_maze/index.js'),
    'stage-3': () => import('../stages/stage3_flappy/index.js'),
    'stage-4': () => import('../stages/stage4_twist/index.js'),
    'stage-5': () => import('../stages/stage5_world/index.js'),
    'stage-6': () => import('../stages/stage6_devil/index.js?v=130'),
    'stage-7': () => import('../stages/stage7_gift/index.js'),
    'stage-8': () => import('../stages/stage8_finale/index.js?v=133'),
};

let currentModule = null;
let isNavigating = false;

export async function routeGuard() {
    if (isNavigating) return;
    isNavigating = true;

    let hash = window.location.hash.replace('#/', '');
    if (!hash) {
        hash = 'stage-1';
        window.history.replaceState(null, '', '#/stage-1');
    }

    const stageMatch = hash.match(/stage-(\d+)/);
    const targetStage = stageMatch ? parseInt(stageMatch[1], 10) : 1;
    const highestUnlocked = getHighestUnlockedStage();

    if (targetStage > highestUnlocked && !isDevModeActive()) {
        console.warn(`[Anti-Cheat] Attempted to access stage ${targetStage}. Highest unlocked is ${highestUnlocked}.`);
        window.location.hash = `#/stage-${highestUnlocked}`;
        isNavigating = false;
        return;
    }

    if (routes[hash]) {
        if (currentModule && currentModule.destroy) {
            currentModule.destroy();
        }

        try {
            const module = await routes[hash]();
            currentModule = module;
            
            window.history.pushState({ stage: hash }, '', `#/${hash}`);
            
            if (module.init) {
                module.init();
            }
        } catch (err) {
            console.error('Failed to load stage:', err);
            document.getElementById('app').innerHTML = `
                <div style="padding: 20px;">
                    <h2>Error loading stage</h2>
                    <p>${err.message}</p>
                </div>
            `;
        }
    } else {
        window.location.hash = '#/stage-1';
    }
    
    isNavigating = false;
}

window.__isProgrammaticNav = false;

window.goToStage = function(stageNum) { 
    window.__isProgrammaticNav = true;
    const hash = 'stage-' + stageNum; 
    window.history.pushState({ stage: hash }, '', '#/' + hash); 
    routeGuard(); 
    setTimeout(() => { window.__isProgrammaticNav = false; }, 200);
};

window.transitionToStage = function(stageNum) {
    if (window.__isTransitioning) return;
    window.__isTransitioning = true;
    
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '1000000';
    canvas.style.pointerEvents = 'all'; // block clicks during transition
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 0.3s ease-in';
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    // Fill black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setTimeout(() => { canvas.style.opacity = '1'; }, 10);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    ctx.fillStyle = '#0f0';
    ctx.font = '16px monospace';
    
    const cols = Math.floor(canvas.width / 10);
    const rows = Math.floor(canvas.height / 16);
    
    const totalCells = cols * rows;
    let cells = Array.from({length: totalCells}, (_, i) => i);
    // Shuffle
    for(let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    let idx = 0;
    // We want to fill `totalCells` in about 1.2 seconds.
    // at 60fps (16ms), that's ~75 frames.
    const charsPerFrame = Math.ceil(totalCells / 75);

    let drawInterval;
    setTimeout(() => {
        drawInterval = setInterval(() => {
            for(let k = 0; k < charsPerFrame; k++) {
                if (idx >= cells.length) {
                    clearInterval(drawInterval);
                    break;
                }
                const cell = cells[idx++];
                const c = cell % cols;
                const r = Math.floor(cell / cols);
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, c * 10, r * 16 + 16);
            }
        }, 16);
    }, 300); // wait for fade in

    // After 2 seconds total, navigate and fade out
    setTimeout(() => {
        clearInterval(drawInterval);
        window.goToStage(stageNum);
        
        setTimeout(() => {
            canvas.style.transition = 'opacity 1s ease-out';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.remove();
                window.__isTransitioning = false;
            }, 1000);
        }, 100); // Small delay to let next stage render
    }, 2000);
};

export function initRouter() {
    routeGuard();

    window.addEventListener('hashchange', () => {
        routeGuard();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
            e.preventDefault(); 
            if (currentModule) {
                if (currentModule.destroy) currentModule.destroy();
                if (currentModule.init) currentModule.init();
            } else {
                routeGuard();
            }
        }
    });
}













