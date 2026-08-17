export function initCursor() {
    const mainCursor = document.createElement('div');
    mainCursor.id = 'neon-cursor';
    mainCursor.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 12px; height: 12px;
        background: #0f0;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000000;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 10px #0f0, 0 0 20px #0f0, 0 0 40px #0f0;
        display: none;
        transition: width 0.2s, height 0.2s, background-color 0.2s;
    `;
    document.body.appendChild(mainCursor);

    // Trails for ghosting effect
    const trails = [];
    for(let i=0; i<8; i++) {
        const t = document.createElement('div');
        t.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: ${10 - i}px; height: ${10 - i}px;
            background: rgba(0, 255, 0, ${0.7 - i*0.08});
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999999;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px rgba(0,255,0,0.5);
            display: none;
        `;
        document.body.appendChild(t);
        trails.push({ el: t, x: -100, y: -100 });
    }

    let mouseX = -100;
    let mouseY = -100;
    let isVisible = false;
    let isActive = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Hover effects on clickable items
        const target = e.target;
        const isClickable = target.closest('a') || target.closest('button') || target.closest('input') || window.getComputedStyle(target).cursor === 'pointer';
        
        if (isClickable) {
            mainCursor.style.width = '20px';
            mainCursor.style.height = '20px';
            mainCursor.style.backgroundColor = '#fff';
            mainCursor.style.boxShadow = '0 0 15px #fff, 0 0 30px #0f0';
        } else {
            mainCursor.style.width = '12px';
            mainCursor.style.height = '12px';
            mainCursor.style.backgroundColor = '#0f0';
            mainCursor.style.boxShadow = '0 0 10px #0f0, 0 0 20px #0f0, 0 0 40px #0f0';
        }
    });

    function shouldShowCursor() {
        const hash = window.location.hash || '';
        // Disable on Stage 4 and Stage 5
        return !(hash.includes('stage-4') || hash.includes('stage-5'));
    }

    function animate() {
        const show = shouldShowCursor();
        
        if (show) {
            if (!isVisible && mouseX > 0) {
                mainCursor.style.display = 'block';
                trails.forEach(t => t.el.style.display = 'block');
                isVisible = true;
            }
            if (!isActive) {
                document.body.classList.add('custom-cursor-active');
                isActive = true;
            }

            mainCursor.style.left = mouseX + 'px';
            mainCursor.style.top = mouseY + 'px';
            
            // Lerp trails for ghosting effect
            let prevX = mouseX;
            let prevY = mouseY;
            for(let i=0; i<trails.length; i++) {
                trails[i].x += (prevX - trails[i].x) * 0.45;
                trails[i].y += (prevY - trails[i].y) * 0.45;
                trails[i].el.style.left = trails[i].x + 'px';
                trails[i].el.style.top = trails[i].y + 'px';
                prevX = trails[i].x;
                prevY = trails[i].y;
            }
        } else {
            if (isVisible) {
                mainCursor.style.display = 'none';
                trails.forEach(t => t.el.style.display = 'none');
                isVisible = false;
            }
            if (isActive) {
                document.body.classList.remove('custom-cursor-active');
                isActive = false;
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}
