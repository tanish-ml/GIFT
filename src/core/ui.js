export function applyCyberpunkDecoder(el) {
    if (!el) return;
    
    // Store original text if not already stored
    if (!el.dataset.originalText) {
        el.dataset.originalText = el.innerText;
    }
    
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!¿§";
    
    const scramble = () => {
        let iteration = 0;
        const targetText = el.dataset.originalText;
        
        // Clean up previous interval if it exists on the element
        if (el._scrambleInterval) {
            clearInterval(el._scrambleInterval);
        }
        
        el._scrambleInterval = setInterval(() => {
            el.innerText = targetText
                .split("")
                .map((letter, index) => {
                    if (letter === ' ' || letter === '\n') return letter;
                    if (index < iteration) {
                        return targetText[index];
                    }
                    return letters[Math.floor(Math.random() * letters.length)];
                })
                .join("");
            
            if (iteration >= targetText.length) {
                clearInterval(el._scrambleInterval);
                el.innerText = targetText; // Ensure exact match
            }
            
            iteration += 1 / 3;
        }, 30);
    };

    // Apply styles to show it's interactive if not already styled
    el.style.cursor = "pointer";
    el.style.userSelect = "none";
    
    // Scramble immediately on mount
    scramble();
    
    // Scramble on hover
    // Remove existing listener to prevent duplicates
    if (el._scrambleHandler) {
        el.removeEventListener('mouseenter', el._scrambleHandler);
    }
    el._scrambleHandler = scramble;
    el.addEventListener('mouseenter', el._scrambleHandler);
}
