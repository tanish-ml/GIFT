import{s as m,f as M,i as S,g as C,t as N,u as B}from"./index-B6R57jzx.js";import{a as z}from"./ui-MGXCfiiX.js";let p,t,a=!1,A=!1,c=[],f=window.innerWidth/2,g=window.innerHeight/2,u=null,d=2e3,y=null,l=!1,h,x,k,v;const I=["https://puginarug.com/","https://www.window-swap.com/Window","https://radio.garden/visit/pratapgarh/UjVL530T","http://weavesilk.com/","https://www.nytimes.com/games/wordle/index.html","https://paint.toys/symmetry/","https://jacksonpollock.org/","https://hackertyper.net/","https://littlealchemy2.com/","https://optical.toys/","https://www.bored.com/cool-websites/","https://neal.fun/","https://neal.fun/life-stats/","https://neal.fun/size-of-space/","https://neal.fun/dark-patterns/","https://neal.fun/asteroid-launcher/","https://neal.fun/lets-settle-this/","https://neal.fun/ambient-chaos/","https://neal.fun/stimulation-clicker/"];function O(){M("/music/monume-cyberpunk-519219.mp3"),m(.5);const i=document.getElementById("app");i.innerHTML=`
        <div class="stage4-container" id="stage4-container">
            <div class="audio-overlay" id="audio-overlay">
                <h2>STAGE 4: THE BLIND HACKER</h2>
                <p style="margin-bottom: 20px; font-size: 16px;">This challenge requires audio. Pinpoint the hidden data node using sonar.</p>
                <p style="margin-bottom: 40px; font-size: 16px; color:#a00;">WARNING: Multiple corrupted signals detected.</p>
                <button class="btn-start-audio" id="btn-start">ENABLE AUDIO SCANNERS</button>
            </div>
            
            <div class="win-overlay" id="win-overlay">
                <h1>NODE EXTRACTED</h1>
                <p>DECRYPTION KEY ACQUIRED</p>
                <p>Redirecting to Stage 5...</p>
            </div>
            
            <div class="ui-tracker">
                <div class="radar-sweep"></div>
                STATUS: SCANNING...
            </div>
            
            <div id="instruction-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column; color:#0f0; font-family:monospace; padding: 20px; text-align:center;">
                <h2 style="font-size: 32px; margin-bottom: 20px; text-shadow: 0 0 10px #0f0;">STAGE 4 INSTRUCTIONS</h2>
                <p style="font-size: 18px; margin-bottom: 10px;">You are blind. Use the audio sonar to locate the data node.</p>
                <p style="font-size: 18px; margin-bottom: 30px;">The node emits a high-pitched, clean sine wave. Click when the true signal is loudest.</p>
                   <p style="font-size: 18px; margin-bottom: 10px;">Use mouse to find where the pitch is correct. It is advised to move your mouse slowly.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press 'H' to resume.</p>
                <p style="font-size: 14px; opacity: 0.7;">Press Shift+F to toggle fullscreen.</p>
                <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="vol-slider-4" style="font-size: 14px;">Music Volume</label>
                    <input type="range" id="vol-slider-4" min="0" max="1" step="0.05" style="width: 200px; accent-color: #0f0;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="btn-toggle-music-4" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">Toggle Music</button>
                        <button onclick="window.toggleFullscreen()" style="background: transparent; border: 1px solid #0f0; color: #0f0; padding: 5px 15px; cursor: pointer; font-family: monospace;">[ ] Fullscreen</button>
                    </div>
                </div>
            </div>
        </div>
    `,p=document.getElementById("stage4-container"),m(.15),l=!1,c=[];const n=100,s=window.innerWidth-n*2,r=window.innerHeight-n*2;if(c.push({x:n+Math.random()*s,y:n+Math.random()*r,type:"true"}),S())for(let o of c){const e=document.createElement("div");e.style.position="absolute",e.style.left=o.x+"px",e.style.top=o.y+"px",e.style.width="20px",e.style.height="20px",e.style.transform="translate(-50%, -50%)",e.style.borderRadius="50%",e.style.pointerEvents="none",o.type==="true"?(e.style.background="#0f0",e.style.boxShadow="0 0 20px #0f0"):(e.style.background="#f00",e.style.boxShadow="0 0 20px #f00"),p.appendChild(e)}k=()=>{document.getElementById("audio-overlay").style.display="none",D()},document.getElementById("btn-start").addEventListener("click",k),h=o=>{!a||l||(f=o.clientX,g=o.clientY,L())},x=o=>{if(!(!a||l||o.target.tagName==="BUTTON")){for(let e of c)if(Math.hypot(e.x-f,e.y-g)<80){e.type==="true"?G():R();return}}};const b=document.querySelector("#instruction-popup h2");b&&z(b),v=o=>{if(o.key.toLowerCase()==="h"&&!A)if(l=!l,document.getElementById("instruction-popup").style.display=l?"flex":"none",l){const e=document.getElementById("vol-slider-4");e&&(e.value=C()),clearTimeout(u),t&&t.state==="running"&&t.suspend()}else t&&t.state==="suspended"&&t.resume(),a&&w()},document.addEventListener("mousemove",h),document.addEventListener("click",x),document.addEventListener("keydown",v);const T=document.getElementById("vol-slider-4");T&&T.addEventListener("input",o=>{m(parseFloat(o.target.value))});const E=document.getElementById("btn-toggle-music-4");E&&E.addEventListener("click",()=>{N()})}function D(){const i=window.AudioContext||window.webkitAudioContext;t=new i,a=!0,L(),w()}function L(){let i=1/0,n=null;for(let s of c){const r=Math.hypot(s.x-f,s.y-g);r<i&&(i=r,n=s)}d=i,y=n,d<80?p.classList.add("glitching"):p.classList.remove("glitching")}function w(){if(!a)return;if(y){const n=t.createOscillator(),s=t.createGain();n.connect(s),s.connect(t.destination),y.type==="true"?(n.type="sine",n.frequency.value=400+Math.max(0,800-d)):(n.type="square",n.frequency.value=100+Math.max(0,300-d*.5));const r=Math.max(.1,1-d/1e3);s.gain.setValueAtTime(r,t.currentTime),s.gain.exponentialRampToValueAtTime(.01,t.currentTime+.1),n.start(),n.stop(t.currentTime+.1)}const i=Math.max(40,Math.min(1e3,d));u=setTimeout(w,i)}function R(){a=!1,clearTimeout(u),t&&t.close();const i=I[Math.floor(Math.random()*I.length)];window.location.href=i}function G(){a=!1,A=!0,clearTimeout(u),t&&t.close(),p.classList.remove("glitching"),document.getElementById("win-overlay").style.display="flex",setTimeout(()=>{B(5),window.transitionToStage(5)},2e3)}function V(){a=!1,m(1),clearTimeout(u),t&&t.close(),document.removeEventListener("mousemove",h),document.removeEventListener("click",x),document.removeEventListener("keydown",v)}export{V as destroy,O as init};
