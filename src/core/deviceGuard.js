export function checkDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;

    if (isMobile || isSmallScreen) {
        document.body.innerHTML = `
            <div style="
                position: fixed; 
                top: 0; left: 0; width: 100vw; height: 100vh; 
                background: #000; color: #0f0; 
                display: flex; align-items: center; justify-content: center; 
                text-align: center; font-family: monospace; padding: 20px;
                z-index: 999999;
            ">
                <div>
                    <h2>Mobile/Tablet Detected</h2>
                    <p>This experience is designed exclusively for desktop/laptop browsers.</p>
                    <p>Please open this link on a larger device.</p>
                </div>
            </div>
        `;
        throw new Error("Mobile device blocked.");
    }
}
