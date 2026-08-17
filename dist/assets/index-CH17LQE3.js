import{f as L,s as b,i as k,g as I,t as B,a,u as C}from"./index-B6R57jzx.js";import{a as x}from"./ui-MGXCfiiX.js";let m,h,r,g,w,d=1,c=!1,f;const p=[{id:1,text:"Password must be at least 10 characters long.",check:e=>e.length>=10},{id:2,text:"Must contain an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*()_+-=).",check:e=>/[A-Z]/.test(e)&&/[a-z]/.test(e)&&/[0-9]/.test(e)&&/[!@#$%^&*()_+\-=]/.test(e)},{id:3,text:"The digits in your password must add up exactly to 35.",check:e=>e.split("").reduce((t,i)=>/\d/.test(i)?t+parseInt(i):t,0)===35},{id:4,text:"Must contain today's day of the week.",check:e=>{const s=new Date().toLocaleDateString("en-US",{weekday:"long"}).toLowerCase();return e.toLowerCase().includes(s)}},{id:5,text:"Must contain a valid Roman numeral (I, V, X, L, C, D, M).",check:e=>/[IVXLCDM]/.test(e)},{id:6,text:"Must contain the name of the internship where you met.",check:e=>e.toLowerCase().includes("dentsu")},{id:7,text:"Must include the current month.",check:e=>{const s=new Date().toLocaleDateString("en-US",{month:"long"}).toLowerCase();return e.toLowerCase().includes(s)}},{id:8,text:"Must include a 2-letter periodic table element symbol.",check:e=>/(He|Li|Be|Ne|Na|Mg|Al|Si|Cl|Ar|Ca|Sc|Ti|Cr|Mn|Fe|Co|Ni|Cu|Zn|Ga|Ge|As|Se|Br|Kr|Rb|Sr|Zr|Nb|Mo|Tc|Ru|Rh|Pd|Ag|Cd|In|Sn|Sb|Te|Xe|Cs|Ba|La|Ce|Pr|Nd|Pm|Sm|Eu|Gd|Tb|Dy|Ho|Er|Tm|Yb|Lu|Hf|Ta|Re|Os|Ir|Pt|Au|Hg|Tl|Pb|Bi|Po|At|Rn|Fr|Ra|Ac|Th|Pa|Np|Pu|Am|Cm|Bk|Cf|Es|Fm|Md|No|Lr|Rf|Db|Sg|Bh|Hs|Mt|Ds|Rg|Cn|Nh|Fl|Mc|Lv|Ts|Og)/.test(e)},{id:9,text:"The total character length of the password must be an even number.",check:e=>e.length%2===0},{id:10,text:"Must contain the answer to 'Who is coolest?'.",check:e=>e.toLowerCase().includes("me")},{id:11,text:"Must include a 24-hour time string matching the current hour rounded to the nearest whole hour (e.g., 14:00).",check:e=>{const s=new Date;let t=s.getHours();s.getMinutes()>=30&&(t=(t+1)%24);const i=t.toString().padStart(2,"0");return e.includes(`${i}:00`)}},{id:12,text:"Must contain a hex color code.",check:e=>/#[A-Fa-f0-9]{6}/.test(e)},{id:13,text:"Must contain the Roman numeral representation of the birthday date.",check:e=>e.includes("XIX")},{id:14,text:"Must contain the word Bhanu (case-insensitive).",check:e=>e.toLowerCase().includes("bhanu")},{id:15,text:"Must NOT contain the word password or 1234.",check:e=>!e.toLowerCase().includes("password")&&!e.includes("1234")},{id:16,text:"Must end with an exclamation mark (!).",check:e=>e.endsWith("!")}];function N(){L("/music/hauntsync-dark-orchestral-synthwave-tribute-to-drone-operators-231877.mp3"),b(.3);const e=document.getElementById("app");e.innerHTML=`
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
    `,m=document.getElementById("login-form"),h=document.getElementById("password-game"),r=document.getElementById("inp-password"),g=document.getElementById("rules-container"),w=document.getElementById("char-count"),k()&&document.getElementById("btn-dev-skip").classList.remove("hidden"),document.getElementById("btn-dev-skip").addEventListener("click",()=>{E()}),document.getElementById("btn-final-submit").addEventListener("click",E),document.getElementById("inp-height").addEventListener("input",n=>{document.getElementById("err-height").innerText="Dev doesn't know your height so we'll trust you."}),document.getElementById("btn-verify").addEventListener("click",T),r.addEventListener("input",()=>{w.innerText=`Length: ${r.value.length}`,u()}),e.querySelectorAll(".input-group label").forEach(n=>{x(n)});const t=document.querySelector("#instruction-popup h2");t&&x(t),f=n=>{if(!(n.target.tagName==="INPUT"||n.target.tagName==="TEXTAREA")&&n.key.toLowerCase()==="h"&&(c=!c,document.getElementById("instruction-popup").style.display=c?"flex":"none",c)){const l=document.getElementById("vol-slider-1");l&&(l.value=I())}},document.addEventListener("keydown",f);const i=document.getElementById("vol-slider-1");i&&i.addEventListener("input",n=>{b(parseFloat(n.target.value))});const o=document.getElementById("btn-toggle-music-1");o&&o.addEventListener("click",()=>{B()})}function T(){const e={first:document.getElementById("inp-firstname").value.trim().toLowerCase(),last:document.getElementById("inp-lastname").value.trim().toLowerCase(),bday:document.getElementById("inp-birthday").value.trim().toLowerCase(),height:document.getElementById("inp-height").value.trim(),intern:document.getElementById("inp-internship").value.trim().toLowerCase(),cool:document.getElementById("inp-coolest").value.trim().toLowerCase(),curr:document.getElementById("inp-currency").value.trim().toLowerCase(),trap:document.getElementById("inp-trapped").value.trim().toLowerCase()};let s=!0;if(k()){a("firstname",e.first),a("lastname",e.last),a("birthday",e.bday),a("height",e.height),a("internship",e.intern),m.classList.add("hidden"),h.classList.remove("hidden"),r.focus(),u();return}const t=(o,n,l)=>{const y=document.getElementById(`err-${o}`),v=document.getElementById(`inp-${o}`);n?y.innerText="":(y.innerText=l,v.parentElement.classList.add("shake"),setTimeout(()=>v.parentElement.classList.remove("shake"),400),s=!1)};t("firstname",e.first==="bhanu","Incorrect first name."),t("lastname",e.last==="girotra","Incorrect last name."),t("birthday",["19th aug","19 aug","19th august","19 august"].includes(e.bday),"Incorrect birthday."),t("internship",e.intern==="dentsu","Incorrect internship."),t("coolest",e.cool==="me","Incorrect."),t("currency",e.curr==="egg"||e.curr==="an egg","Incorrect."),t("trapped",e.trap==="me","Incorrect."),s&&(a("firstname",e.first),a("lastname",e.last),a("birthday",e.bday),a("height",e.height),a("internship",e.intern),m.classList.add("hidden"),h.classList.remove("hidden"),r.focus(),u())}function u(){const e=r.value,s=[];let t=!0;for(let i=0;i<d;i++){const o=p[i],n=o.check(e);s.push({rule:o,passed:n}),n||(t=!1)}if(s.sort((i,o)=>i.passed===o.passed?o.rule.id-i.rule.id:i.passed?1:-1),g.innerHTML="",s.forEach(i=>{const o=i.rule,n=document.createElement("div");n.id=`rule-${o.id}`,i.passed?(n.className="rule-box pass",n.innerHTML=`
                <div class="rule-header">
                    <span>Rule ${o.id}</span>
                    <span class="status-icon">✓</span>
                </div>
                <div class="rule-text">${o.text}</div>
            `):(n.className="rule-box fail",n.innerHTML=`
                <div class="rule-header">
                    <span>Rule ${o.id}</span>
                    <span class="status-icon">✗</span>
                </div>
                <div class="rule-text">${o.text}</div>
            `),g.appendChild(n)}),t&&d<p.length){d++,u();return}t&&d===p.length?document.getElementById("final-success-container").classList.remove("hidden"):document.getElementById("final-success-container").classList.add("hidden")}function E(){r.disabled=!0,a("final_password",r.value),C(2);const e=document.createElement("div");e.className="unlock-overlay",e.innerText="ACCESS GRANTED",document.body.appendChild(e),setTimeout(()=>{e.parentElement&&e.remove(),window.transitionToStage(2)},1500)}function P(){document.querySelectorAll(".unlock-overlay").forEach(t=>t.remove()),document.removeEventListener("keydown",f);const s=document.getElementById("app");s.innerHTML=""}export{P as destroy,N as init};
