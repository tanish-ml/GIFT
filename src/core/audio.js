let channelA = new Audio();
let channelB = new Audio();
let activeChannel = 'A';
let isPlaying = false;
let pendingTrack = null;
export const MAX_VOLUME = 0.5; // Global cap background music at 50%
let currentMaxVolume = MAX_VOLUME; // Dynamic cap that stages can modify

export function forceTrack(trackUrl) {
    if (isPlaying) {
        const currentAudio = activeChannel === 'A' ? channelA : channelB;
        if (currentAudio.src.endsWith(trackUrl)) {
            currentAudio.volume = currentMaxVolume;
            return;
        }
        currentAudio.pause();
        currentAudio.src = trackUrl;
        currentAudio.loop = true;
        currentAudio.currentTime = 0;
        currentAudio.volume = currentMaxVolume;
        currentAudio.play().catch(e => console.error(e));
    } else {
        pendingTrack = trackUrl;
    }
}

export function setGlobalVolume(vol) {
    currentMaxVolume = vol;
    if (isPlaying) {
        const currentAudio = activeChannel === 'A' ? channelA : channelB;
        currentAudio.volume = currentMaxVolume;
    }
}

export function getGlobalVolume() {
    return currentMaxVolume;
}

let audioCtx;
let analyser;
let dataArray;
let isAnalyzerReady = false;

export function initAudioAnalyzer() {
    if (isAnalyzerReady) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        channelA.crossOrigin = "anonymous";
        channelB.crossOrigin = "anonymous";
        
        const sourceA = audioCtx.createMediaElementSource(channelA);
        const sourceB = audioCtx.createMediaElementSource(channelB);
        
        sourceA.connect(analyser);
        sourceB.connect(analyser);
        analyser.connect(audioCtx.destination);
        isAnalyzerReady = true;
    } catch (e) {
        console.warn("[Audio] Failed to initialize AudioContext analyzer:", e);
    }
}

export function getAudioData() {
    if (!isAnalyzerReady || !analyser) {
        return { energy: 0, dataArray: null };
    }
    
    // Resume context if suspended
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    return {
        energy: dataArray.length > 0 ? (sum / dataArray.length) : 0,
        dataArray: dataArray
    };
}

export function initGlobalAudio() {
    console.log("[Audio] Initializing global audio listener...");
    if (isPlaying || window._audioInitialized) return;
    
    channelA.style.display = 'none';
    channelB.style.display = 'none';
    document.body.appendChild(channelA);
    document.body.appendChild(channelB);
    
    const startAudio = () => {
        if (!window._audioInitialized) {
            console.log("[Audio] First interaction detected! Starting playback...");
            window._audioInitialized = true;
            isPlaying = true;
            if (pendingTrack) {
                channelA.src = pendingTrack;
                channelA.loop = true;
                channelA.volume = currentMaxVolume;
                channelA.play().catch(e => console.error(e));
                activeChannel = 'A';
            }
        }
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keydown', startAudio);
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
}

export function toggleMusic() {
    if (isPlaying) {
        isPlaying = false;
        channelA.pause();
        channelB.pause();
    } else {
        isPlaying = true;
        const currentAudio = activeChannel === 'A' ? channelA : channelB;
        currentAudio.play().catch(e => console.error(e));
    }
    return isPlaying;
}

let synthCtx = null;
function playSynthBeep(e) {
    const hash = window.location.hash;
    if (!['#stage3', '#stage4', '#stage5', '#stage6'].includes(hash)) return;
    
    if (e.type === 'keydown') {
        const key = e.key.toLowerCase();
        if (!['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            return;
        }
    }

    if (!synthCtx) {
        synthCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (synthCtx.state === 'suspended') synthCtx.resume();
    
    const osc = synthCtx.createOscillator();
    const gain = synthCtx.createGain();
    
    const cMinorPentatonic = [
        130.81, 155.56, 174.61, 196.00, 233.08,
        261.63, 311.13, 349.23, 392.00, 466.16,
        523.25, 622.25, 698.46, 783.99, 932.33
    ];
    
    osc.frequency.value = cMinorPentatonic[Math.floor(Math.random() * cMinorPentatonic.length)];
    osc.type = Math.random() > 0.5 ? 'square' : 'triangle';
    
    osc.connect(gain);
    gain.connect(synthCtx.destination);
    
    const now = synthCtx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.2);
}

window.addEventListener('click', playSynthBeep);
window.addEventListener('keydown', playSynthBeep);
