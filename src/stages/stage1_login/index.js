import { saveAnswer, unlockStage, isDevModeActive } from '../../core/state.js';
import { getGlobalVolume, setGlobalVolume, toggleMusic, forceTrack } from '../../core/audio.js';
import { applyCyberpunkDecoder } from '../../core/ui.js';

let loginForm, pwdGame, pwdInput, rulesContainer, charCount;
let rulesActive = 1;
let gamePaused = false;
let boundKeydown;

// Removed Rule 16 and removed all examples from the rule text
const rules = [
    {
        id: 1,
        text: "Password must be at least 10 characters long.",
        check: (pwd) => pwd.length >= 10
    },
    {
        id: 2,
        text: "Must contain an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*()_+-=).",
        check: (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*()_+\-=]/.test(pwd)
    },
    {
        id: 3,
        text: "The digits in your password must add up exactly to 35.",
        check: (pwd) => {
            const sum = pwd.split('').reduce((acc, char) => /\d/.test(char) ? acc + parseInt(char) : acc, 0);
            return sum === 35;
        }
    },
    {
        id: 4,
        text: "Must contain today's day of the week.",
        check: (pwd) => {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            return pwd.toLowerCase().includes(today);
        }
    },
    {
        id: 5,
        text: "Must contain a valid Roman numeral (I, V, X, L, C, D, M).",
        check: (pwd) => /[IVXLCDM]/.test(pwd)
    },
    {
        id: 6,
        text: "Must contain the name of the internship where you met.",
        check: (pwd) => pwd.toLowerCase().includes('dentsu')
    },
    {
        id: 7,
        text: "Must include the current month.",
        check: (pwd) => {
            const month = new Date().toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
            return pwd.toLowerCase().includes(month);
        }
    },
    {
        id: 8,
        text: "Must include a 2-letter periodic table element symbol.",
        check: (pwd) => /(He|Li|Be|Ne|Na|Mg|Al|Si|Cl|Ar|Ca|Sc|Ti|Cr|Mn|Fe|Co|Ni|Cu|Zn|Ga|Ge|As|Se|Br|Kr|Rb|Sr|Zr|Nb|Mo|Tc|Ru|Rh|Pd|Ag|Cd|In|Sn|Sb|Te|Xe|Cs|Ba|La|Ce|Pr|Nd|Pm|Sm|Eu|Gd|Tb|Dy|Ho|Er|Tm|Yb|Lu|Hf|Ta|Re|Os|Ir|Pt|Au|Hg|Tl|Pb|Bi|Po|At|Rn|Fr|Ra|Ac|Th|Pa|Np|Pu|Am|Cm|Bk|Cf|Es|Fm|Md|No|Lr|Rf|Db|Sg|Bh|Hs|Mt|Ds|Rg|Cn|Nh|Fl|Mc|Lv|Ts|Og)/.test(pwd)
    },
    {
        id: 9,
        text: "The total character length of the password must be an even number.",
        check: (pwd) => pwd.length % 2 === 0
    },
    {
        id: 10,
        text: "Must contain the answer to 'Who is coolest?'.",
        check: (pwd) => pwd.toLowerCase().includes('me')
    },
    {
        id: 11,
        text: "Must include a 24-hour time string matching the current hour rounded to the nearest whole hour (e.g., 14:00).",
        check: (pwd) => {
            const now = new Date();
            let hr = now.getHours();
            if (now.getMinutes() >= 30) {
                hr = (hr + 1) % 24;
            }
            const hrStr = hr.toString().padStart(2, '0');
            return pwd.includes(`${hrStr}:00`);
        }
    },
    {
        id: 12,
        text: "Must contain a hex color code.",
        check: (pwd) => /#[A-Fa-f0-9]{6}/.test(pwd)
    },
    {
        id: 13,
        text: "Must contain the Roman numeral representation of the birthday date.",
        check: (pwd) => pwd.includes('XIX')
    },
    {
        id: 14,
        text: "Must contain the word Bhanu (case-insensitive).",
        check: (pwd) => pwd.toLowerCase().includes('bhanu')
    },
    {
        id: 15,
        text: "Must NOT contain the word password or 1234.",
        check: (pwd) => !pwd.toLowerCase().includes('password') && !pwd.includes('1234')
    },
    {
        id: 16,
        text: "Must end with an exclamation mark (!).",
        check: (pwd) => pwd.endsWith('!')
    }
];

export function init() {
    forceTrack('/music/hauntsync-dark-orchestral-synthwave-tribute-to-drone-operators-231877.mp3');
    setGlobalVolume(0.3);
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="stage1-container">
            <!-- Part 1: Login Form -->
            <div id="login-form" class="login-form">
                <div class="form-header">
                    <h2>Identity Verification</h2>
                    <p>Enter details to proceed</p>
                </div>
                
                <div class="input-group">
                    <label>First Name</label>
                    <input type="text" id="inp-firstname" autocomplete="off" spellcheck="false">
                    <div class="error-text" id="err-firstname"></div>
                </div>
                <div class="input-group">
                    <label>Last Name</label>
                    <input type="text" id="inp-lastname" autocomplete="off" spellcheck="false">
                    <div class="error-text" id="err-lastname"></div>
                </div>
                <div class="input-group">
                    <label>Birthday</label>
                    <input type="text" id="inp-birthday" autocomplete="off" spellcheck="false" placeholder="e.g. 1st Jan">
                    <div class="error-text" id="err-birthday"></div>
                </div>
                <div class="input-group">
                    <label>Height</label>
                    <input type="text" id="inp-height" autocomplete="off" spellcheck="false">
                    <div class="error-text" id="err-height" style="color:#aaa;"></div>
                </div>
                <div class="input-group">
                    <label>In which internship did we meet?</label>
                    <input type="text" id="inp-internship" autocomplete="off" spellcheck="false">
                    <div class="error-text" id="err-internship"></div>
                </div>
                <div class="input-group">
                    <label>Who is coolest?</label>
                    <input type="text" id="inp-coolest" autocomplete="off" spellcheck="false">
                    <div class="error-text" id="err-coolest"></div>
                </div>
                <div class="input-group">
                    <label>What has to be broken before you can use it?</label>
                    <input type="text" id="inp-currency" autocomplete="off" spellcheck="false">
                    <div class="error-text" id="err-currency"></div>
                </div>
                <div class="input-group">
                    <label>Who is trapped in this escape room?</label>
                    <input type="text" id="inp-trapped" autocomplete="off" spellcheck="false">
                    <div class="error-text" id="err-trapped"></div>
                </div>
                
                <button id="btn-verify" class="btn-submit">Verify Identity</button>
            </div>

            <!-- Part 2: Password Game -->
            <div id="password-game" class="password-game hidden">
                <div class="form-header">
                    <h2>Identity verified!</h2>
                    <p>For security compliance, please set a new password.  Note: Remember your password </p>
                </div>
                <div class="input-group">
                    <label>New Password</label>
                    <input type="text" id="inp-password" autocomplete="off" spellcheck="false">
                    <div id="char-count" class="char-count">Length: 0</div>
                </div>
                <div id="rules-container" class="rules-container"></div>
                <div id="final-success-container" class="hidden" style="margin-top: 20px; text-align: center;">
                    <p style="color: #0f0; margin-bottom: 15px;">Nice password, now nobody can steal your identity.</p>
                    <button id="btn-final-submit" class="btn-submit">Confirm Password & Proceed</button>
                </div>
                <button id="btn-dev-skip" class="btn-submit hidden" style="margin-top:20px; border-color:#0ff; color:#0ff;">[DEV] Skip to Stage 2</button>
            </div>
            
            <div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center;">
                <h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 1 INSTRUCTIONS</h2>
                <p style="font-size: 18px; margin-bottom: 10px;">Fill out the required personal details to verify your identity.</p>
                <p style="font-size: 18px; margin-bottom: 30px;">If you pass, you will need to create a secure password that passes all compliance rules.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press 'H' to resume.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p>
                <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="vol-slider-1" style="font-size: 14px;">Music Volume</label>
                    <input type="range" id="vol-slider-1" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="btn-toggle-music-1" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button>
                        <button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Cache elements
    loginForm = document.getElementById('login-form');
    pwdGame = document.getElementById('password-game');
    pwdInput = document.getElementById('inp-password');
    rulesContainer = document.getElementById('rules-container');
    charCount = document.getElementById('char-count');

    if (isDevModeActive()) {
        document.getElementById('btn-dev-skip').classList.remove('hidden');
    }
    
    document.getElementById('btn-dev-skip').addEventListener('click', () => {
        handleStageComplete();
    });

    document.getElementById('btn-final-submit').addEventListener('click', handleStageComplete);

    document.getElementById('inp-height').addEventListener('input', (e) => {
        document.getElementById('err-height').innerText = "Dev doesn't know your height so we'll trust you.";
    });

    document.getElementById('btn-verify').addEventListener('click', handleVerify);
    
    // Password input listener
    pwdInput.addEventListener('input', () => {
        charCount.innerText = `Length: ${pwdInput.value.length}`;
        validatePassword();
    });

    // Apply Cyberpunk Decoder to all input labels
    const labels = app.querySelectorAll('.input-group label');
    labels.forEach(label => {
        applyCyberpunkDecoder(label);
    });
    
    const instrTitle = document.querySelector('#instruction-popup h2');
    if (instrTitle) applyCyberpunkDecoder(instrTitle);

    boundKeydown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 'h') {
            gamePaused = !gamePaused;
            document.getElementById('instruction-popup').style.display = gamePaused ? 'flex' : 'none';
            if (gamePaused) {
                const slider = document.getElementById('vol-slider-1');
                if (slider) slider.value = getGlobalVolume();
            }
        }
    };
    document.addEventListener('keydown', boundKeydown);
    
    const volSlider = document.getElementById('vol-slider-1');
    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            setGlobalVolume(parseFloat(e.target.value));
        });
    }

    const btnToggle = document.getElementById('btn-toggle-music-1');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleMusic();
        });
    }
}

function handleVerify() {
    const vals = {
        first: document.getElementById('inp-firstname').value.trim().toLowerCase(),
        last: document.getElementById('inp-lastname').value.trim().toLowerCase(),
        bday: document.getElementById('inp-birthday').value.trim().toLowerCase(),
        height: document.getElementById('inp-height').value.trim(),
        intern: document.getElementById('inp-internship').value.trim().toLowerCase(),
        cool: document.getElementById('inp-coolest').value.trim().toLowerCase(),
        curr: document.getElementById('inp-currency').value.trim().toLowerCase(),
        trap: document.getElementById('inp-trapped').value.trim().toLowerCase(),
    };

    let isValid = true;

    if (isDevModeActive()) {
        saveAnswer('firstname', vals.first);
        saveAnswer('lastname', vals.last);
        saveAnswer('birthday', vals.bday);
        saveAnswer('height', vals.height);
        saveAnswer('internship', vals.intern);
        
        loginForm.classList.add('hidden');
        pwdGame.classList.remove('hidden');
        pwdInput.focus();
        validatePassword();
        return;
    }

    const checkField = (id, condition, errText) => {
        const errEl = document.getElementById(`err-${id}`);
        const inpEl = document.getElementById(`inp-${id}`);
        if (!condition) {
            errEl.innerText = errText;
            inpEl.parentElement.classList.add('shake');
            setTimeout(() => inpEl.parentElement.classList.remove('shake'), 400);
            isValid = false;
        } else {
            errEl.innerText = '';
        }
    };

    checkField('firstname', vals.first === 'bhanu', 'Incorrect first name.');
    checkField('lastname', vals.last === 'girotra', 'Incorrect last name.');
    
    const validBdays = ['19th aug', '19 aug', '19th august', '19 august'];
    checkField('birthday', validBdays.includes(vals.bday), 'Incorrect birthday.');
    
    checkField('internship', vals.intern === 'dentsu', 'Incorrect internship.');
    checkField('coolest', vals.cool === 'me', 'Incorrect.');
    checkField('currency', vals.curr === 'egg' || vals.curr === 'an egg', 'Incorrect.');
    checkField('trapped', vals.trap === 'me', 'Incorrect.');

    if (isValid) {
        // Save to state
        saveAnswer('firstname', vals.first);
        saveAnswer('lastname', vals.last);
        saveAnswer('birthday', vals.bday);
        saveAnswer('height', vals.height);
        saveAnswer('internship', vals.intern);
        
        // Transition to Password Game
        loginForm.classList.add('hidden');
        pwdGame.classList.remove('hidden');
        pwdInput.focus();
        validatePassword(); // initial validation
    }
}

function validatePassword() {
    const pwd = pwdInput.value;
    
    // Evaluate rules up to rulesActive
    const activeResults = [];
    let allPass = true;

    for (let i = 0; i < rulesActive; i++) {
        const r = rules[i];
        const passed = r.check(pwd);
        activeResults.push({ rule: r, passed });
        if (!passed) allPass = false;
    }

    // Sort the results: Failing rules at the top, passing rules at the bottom
    // For sorting, if passing, we want the newest rules (higher ID) at the top of the passing block.
    // For failing, we want them at the absolute top (highest priority).
    activeResults.sort((a, b) => {
        if (a.passed === b.passed) {
            return b.rule.id - a.rule.id; // newest (highest ID) first
        }
        return a.passed ? 1 : -1; // failing (false) comes before passing (true)
    });

    // Render them
    rulesContainer.innerHTML = '';
    
    activeResults.forEach(res => {
        const r = res.rule;
        const el = document.createElement('div');
        el.id = `rule-${r.id}`;
        
        if (res.passed) {
            el.className = 'rule-box pass';
            el.innerHTML = `
                <div class="rule-header">
                    <span>Rule ${r.id}</span>
                    <span class="status-icon">✓</span>
                </div>
                <div class="rule-text">${r.text}</div>
            `;
        } else {
            el.className = 'rule-box fail';
            el.innerHTML = `
                <div class="rule-header">
                    <span>Rule ${r.id}</span>
                    <span class="status-icon">✗</span>
                </div>
                <div class="rule-text">${r.text}</div>
            `;
        }
        rulesContainer.appendChild(el);
    });

    // If all current rules pass, and there are more rules, activate the next one!
    if (allPass && rulesActive < rules.length) {
        rulesActive++;
        validatePassword(); // re-validate to style and position the newly added rule
        return;
    }

    // If all rules pass, show the final submit button
    if (allPass && rulesActive === rules.length) {
        document.getElementById('final-success-container').classList.remove('hidden');
    } else {
        document.getElementById('final-success-container').classList.add('hidden');
    }
}

function handleStageComplete() {
    pwdInput.disabled = true;
    saveAnswer('final_password', pwdInput.value); // Save the validated password for later
    unlockStage(2);
    
    const flash = document.createElement('div');
    flash.className = 'unlock-overlay';
    flash.innerText = 'ACCESS GRANTED';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentElement) flash.remove();
        window.transitionToStage(2);
    }, 1500);
}

export function destroy() {
    // Force cleanup of any lingering overlays
    const overlays = document.querySelectorAll('.unlock-overlay');
    overlays.forEach(el => el.remove());

    document.removeEventListener('keydown', boundKeydown);

    const app = document.getElementById('app');
    app.innerHTML = '';
}


