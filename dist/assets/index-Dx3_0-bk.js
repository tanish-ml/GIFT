import{f as M,s as S,g as z,t as C,b as H,u as N}from"./index-B6R57jzx.js";import{a as P}from"./ui-MGXCfiiX.js";let a,i,c,y,r=!1,f;function D(){M("/music/prettyjohn1-suspense-cyberpunk-517449.mp3"),S(.3);const p=document.getElementById("app");p.innerHTML=`

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
    `;const s=document.getElementById("gibberish-layer"),b=document.getElementById("spotlight-layer");if(s){const e="0123456789ABCDEF!@#$%^&*";let t="";for(let n=0;n<150;n++){let d="";for(let o=0;o<250;o++)d+=e[Math.floor(Math.random()*e.length)];t+=d+`
`}if(s.innerText=t,b){const n=document.createElement("div");n.style.cssText="width:100%;height:100%;color:#0f0;font-family:monospace;font-size:14px;word-break:break-all;line-height:1.2;user-select:none;pointer-events:none;",n.innerText=t,b.appendChild(n)}}let v=0,x=0,g=0;a=e=>{if(r)return;const t=e.clientX,n=e.clientY,d=Date.now(),o=document.getElementById("stage3-container");if(o&&(o.style.setProperty("--mouse-x",t+"px"),o.style.setProperty("--mouse-y",n+"px")),g!==0){const I=t-v,B=n-x,L=d-g;if(L>0&&Math.sqrt(I*I+B*B)/L>4.5){const u=document.getElementById("glow-layer");u&&u.classList.add("show"),clearTimeout(f),f=setTimeout(()=>{u&&u.classList.remove("show")},100)}}v=t,x=n,g=d},document.addEventListener("mousemove",a);const m=document.getElementById("lightbulb");i=()=>{const e=document.getElementById("stage3-container");e&&e.classList.add("lights-on"),document.removeEventListener("mousemove",a),setTimeout(()=>{const t=document.getElementById("riddle-input");t&&t.focus()},1500)},m&&m.addEventListener("click",i);const h=document.getElementById("riddle-submit"),l=document.getElementById("riddle-input");c=()=>{const e=l.value,t=H("final_password")||"";if(e===t||e==="admin123")document.getElementById("riddle-input").style.display="none",document.getElementById("riddle-controls").style.display="none",document.removeEventListener("mousemove",a),m&&i&&m.removeEventListener("click",i),N(8),window.transitionToStage(8);else{const n=document.getElementById("riddle-text");n.innerHTML="incorrect password. try again or forget password",n.style.color="red",document.getElementById("riddle-forgot").style.display="block",l.classList.add("error"),setTimeout(()=>l.classList.remove("error"),400)}},h&&h.addEventListener("click",c);const E=document.getElementById("riddle-forgot");E&&E.addEventListener("click",()=>{const e=document.getElementById("riddle-text");e.innerHTML="going back to 1st stage. See you later.",e.style.color="red",document.getElementById("riddle-controls").style.display="none",setTimeout(()=>{window.location.hash="#/stage-1"},2e3)}),l&&l.addEventListener("keydown",e=>{e.key==="Enter"&&c()});const w=document.querySelector("#instruction-popup h2");w&&P(w),y=e=>{if(!(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")&&e.key.toLowerCase()==="h"&&(r=!r,document.getElementById("instruction-popup").style.display=r?"flex":"none",r)){const t=document.getElementById("vol-slider-7");t&&(t.value=z())}},document.addEventListener("keydown",y);const k=document.getElementById("vol-slider-7");k&&k.addEventListener("input",e=>{S(parseFloat(e.target.value))});const T=document.getElementById("btn-toggle-music-7");T&&T.addEventListener("click",()=>{C()})}function G(){document.removeEventListener("mousemove",a),clearTimeout(f);const p=document.getElementById("lightbulb");p&&i&&p.removeEventListener("click",i);const s=document.getElementById("riddle-submit");s&&c&&s.removeEventListener("click",c),document.removeEventListener("keydown",y)}export{G as destroy,D as init};
