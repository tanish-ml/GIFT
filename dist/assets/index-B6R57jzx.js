const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CH17LQE3.js","assets/ui-MGXCfiiX.js","assets/index-BFhJCXfH.js","assets/index-wFsm9Ajm.js","assets/index-DHUY2qd6.js","assets/index-57yVszum.js","assets/index-Dx3_0-bk.js"])))=>i.map(i=>d[i]);
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();function B(){const e=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),t=window.innerWidth<=768;if(e||t)throw document.body.innerHTML=`
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
        `,new Error("Mobile device blocked.")}const N="modulepreload",U=function(e){return"/"+e},P={},h=function(t,n,a){let o=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),c=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));o=Promise.allSettled(n.map(r=>{if(r=U(r),r in P)return;P[r]=!0;const d=r.endsWith(".css"),f=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${f}`))return;const i=document.createElement("link");if(i.rel=d?"stylesheet":N,d||(i.as="script"),i.crossOrigin="",i.href=r,c&&i.setAttribute("nonce",c),document.head.appendChild(i),d)return new Promise((g,I)=>{i.addEventListener("load",g),i.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${r}`)))})}))}function s(l){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=l,window.dispatchEvent(c),!c.defaultPrevented)throw l}return o.then(l=>{for(const c of l||[])c.status==="rejected"&&s(c.reason);return t().catch(s)})},D=e=>btoa(JSON.stringify(e)),$=e=>{try{return JSON.parse(atob(e))}catch{return null}},A="_stage_progress",F="_dev_mode";sessionStorage.getItem(A)||sessionStorage.setItem(A,D({highestUnlockedStage:1,answers:{}}));function T(){return $(sessionStorage.getItem(A))||{highestUnlockedStage:1,answers:{}}}function V(e){sessionStorage.setItem(A,D(e))}function H(){return k()?99:T().highestUnlockedStage||1}function Y(e){const t=T();e>t.highestUnlockedStage&&(t.highestUnlockedStage=e,V(t))}function ee(e,t){const n=T();n.answers||(n.answers={}),n.answers[e]=t,V(n)}function te(e){const t=T();return t.answers?t.answers[e]:null}function k(){return sessionStorage.getItem(F)==="true"}function G(){const e=k();return sessionStorage.setItem(F,(!e).toString()),!e}const O={"stage-1":()=>h(()=>import("./index-CH17LQE3.js"),__vite__mapDeps([0,1])),"stage-2":()=>h(()=>import("./index-k2FE25za.js"),[]),"stage-3":()=>h(()=>import("./index-BFhJCXfH.js"),__vite__mapDeps([2,1])),"stage-4":()=>h(()=>import("./index-wFsm9Ajm.js"),__vite__mapDeps([3,1])),"stage-5":()=>h(()=>import("./index-DHUY2qd6.js"),__vite__mapDeps([4,1])),"stage-6":()=>h(()=>import("./index-57yVszum.js"),__vite__mapDeps([5,1])),"stage-7":()=>h(()=>import("./index-Dx3_0-bk.js"),__vite__mapDeps([6,1])),"stage-8":()=>h(()=>import("./index-_jBGqxT1.js"),[])};let p=null,S=!1;async function _(){if(S)return;S=!0;let e=window.location.hash.replace("#/","");e||(e="stage-1",window.history.replaceState(null,"","#/stage-1"));const t=e.match(/stage-(\d+)/),n=t?parseInt(t[1],10):1,a=H();if(n>a&&!k()){console.warn(`[Anti-Cheat] Attempted to access stage ${n}. Highest unlocked is ${a}.`),window.location.hash=`#/stage-${a}`,S=!1;return}if(O[e]){p&&p.destroy&&p.destroy();try{const o=await O[e]();p=o,window.history.pushState({stage:e},"",`#/${e}`),o.init&&o.init()}catch(o){console.error("Failed to load stage:",o),document.getElementById("app").innerHTML=`
                <div style="padding: 20px;">
                    <h2>Error loading stage</h2>
                    <p>${o.message}</p>
                </div>
            `}}else window.location.hash="#/stage-1";S=!1}window.__isProgrammaticNav=!1;window.goToStage=function(e){window.__isProgrammaticNav=!0;const t="stage-"+e;window.history.pushState({stage:t},"","#/"+t),_(),setTimeout(()=>{window.__isProgrammaticNav=!1},200)};window.transitionToStage=function(e){if(window.__isTransitioning)return;window.__isTransitioning=!0;const t=document.createElement("canvas");t.style.position="fixed",t.style.top="0",t.style.left="0",t.style.width="100vw",t.style.height="100vh",t.style.zIndex="1000000",t.style.pointerEvents="all",t.style.opacity="0",t.style.transition="opacity 0.3s ease-in",document.body.appendChild(t),t.width=window.innerWidth,t.height=window.innerHeight;const n=t.getContext("2d");n.fillStyle="#000",n.fillRect(0,0,t.width,t.height),setTimeout(()=>{t.style.opacity="1"},10);const a="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";n.fillStyle="#0f0",n.font="16px monospace";const o=Math.floor(t.width/10),s=Math.floor(t.height/16),l=o*s;let c=Array.from({length:l},(i,g)=>g);for(let i=c.length-1;i>0;i--){const g=Math.floor(Math.random()*(i+1));[c[i],c[g]]=[c[g],c[i]]}let r=0;const d=Math.ceil(l/75);let f;setTimeout(()=>{f=setInterval(()=>{for(let i=0;i<d;i++){if(r>=c.length){clearInterval(f);break}const g=c[r++],I=g%o,q=Math.floor(g/o),K=a[Math.floor(Math.random()*a.length)];n.fillText(K,I*10,q*16+16)}},16)},300),setTimeout(()=>{clearInterval(f),window.goToStage(e),setTimeout(()=>{t.style.transition="opacity 1s ease-out",t.style.opacity="0",setTimeout(()=>{t.remove(),window.__isTransitioning=!1},1e3)},100)},2e3)};function W(){_(),window.addEventListener("hashchange",()=>{_()}),window.addEventListener("keydown",e=>{(e.key==="F5"||e.ctrlKey&&e.key.toLowerCase()==="r")&&(e.preventDefault(),p?(p.destroy&&p.destroy(),p.init&&p.init()):_())})}let u=new Audio,v=new Audio,L="A",x=!1,C=null;const j=.5;let E=j;function oe(e){if(x){const t=L==="A"?u:v;if(t.src.endsWith(e)){t.volume=E;return}t.pause(),t.src=e,t.loop=!0,t.currentTime=0,t.volume=E,t.play().catch(n=>console.error(n))}else C=e}function ne(e){if(E=e,x){const t=L==="A"?u:v;t.volume=E}}function ie(){return E}let w,y,b,M=!1;function se(){if(!M)try{const e=window.AudioContext||window.webkitAudioContext;w=new e,y=w.createAnalyser(),y.fftSize=128,b=new Uint8Array(y.frequencyBinCount),u.crossOrigin="anonymous",v.crossOrigin="anonymous";const t=w.createMediaElementSource(u),n=w.createMediaElementSource(v);t.connect(y),n.connect(y),y.connect(w.destination),M=!0}catch(e){console.warn("[Audio] Failed to initialize AudioContext analyzer:",e)}}function re(){if(!M||!y)return{energy:0,dataArray:null};w&&w.state==="suspended"&&w.resume(),y.getByteFrequencyData(b);let e=0;for(let t=0;t<b.length;t++)e+=b[t];return{energy:b.length>0?e/b.length:0,dataArray:b}}function X(){if(console.log("[Audio] Initializing global audio listener..."),x||window._audioInitialized)return;u.style.display="none",v.style.display="none",document.body.appendChild(u),document.body.appendChild(v);const e=()=>{window._audioInitialized||(console.log("[Audio] First interaction detected! Starting playback..."),window._audioInitialized=!0,x=!0,C&&(u.src=C,u.loop=!0,u.volume=E,u.play().catch(t=>console.error(t)),L="A")),document.removeEventListener("click",e),document.removeEventListener("keydown",e)};document.addEventListener("click",e),document.addEventListener("keydown",e)}function ae(){return x?(x=!1,u.pause(),v.pause()):(x=!0,(L==="A"?u:v).play().catch(t=>console.error(t))),x}let m=null;function z(e){const t=window.location.hash;if(!["#stage3","#stage4","#stage5","#stage6"].includes(t))return;if(e.type==="keydown"){const l=e.key.toLowerCase();if(!["w","a","s","d"," ","arrowup","arrowdown","arrowleft","arrowright"].includes(l))return}m||(m=new(window.AudioContext||window.webkitAudioContext)),m.state==="suspended"&&m.resume();const n=m.createOscillator(),a=m.createGain(),o=[130.81,155.56,174.61,196,233.08,261.63,311.13,349.23,392,466.16,523.25,622.25,698.46,783.99,932.33];n.frequency.value=o[Math.floor(Math.random()*o.length)],n.type=Math.random()>.5?"square":"triangle",n.connect(a),a.connect(m.destination);const s=m.currentTime;a.gain.setValueAtTime(0,s),a.gain.linearRampToValueAtTime(.3,s+.01),a.gain.exponentialRampToValueAtTime(.001,s+.15),n.start(s),n.stop(s+.2)}window.addEventListener("click",z);window.addEventListener("keydown",z);function J(){const e=document.createElement("div");e.id="neon-cursor",e.style.cssText=`
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
    `,document.body.appendChild(e);const t=[];for(let r=0;r<8;r++){const d=document.createElement("div");d.style.cssText=`
            position: fixed;
            top: 0; left: 0;
            width: ${10-r}px; height: ${10-r}px;
            background: rgba(0, 255, 0, ${.7-r*.08});
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999999;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px rgba(0,255,0,0.5);
            display: none;
        `,document.body.appendChild(d),t.push({el:d,x:-100,y:-100})}let n=-100,a=-100,o=!1,s=!1;window.addEventListener("mousemove",r=>{n=r.clientX,a=r.clientY;const d=r.target;d.closest("a")||d.closest("button")||d.closest("input")||window.getComputedStyle(d).cursor==="pointer"?(e.style.width="20px",e.style.height="20px",e.style.backgroundColor="#fff",e.style.boxShadow="0 0 15px #fff, 0 0 30px #0f0"):(e.style.width="12px",e.style.height="12px",e.style.backgroundColor="#0f0",e.style.boxShadow="0 0 10px #0f0, 0 0 20px #0f0, 0 0 40px #0f0")});function l(){const r=window.location.hash||"";return!(r.includes("stage-4")||r.includes("stage-5"))}function c(){if(l()){!o&&n>0&&(e.style.display="block",t.forEach(i=>i.el.style.display="block"),o=!0),s||(document.body.classList.add("custom-cursor-active"),s=!0),e.style.left=n+"px",e.style.top=a+"px";let d=n,f=a;for(let i=0;i<t.length;i++)t[i].x+=(d-t[i].x)*.45,t[i].y+=(f-t[i].y)*.45,t[i].el.style.left=t[i].x+"px",t[i].el.style.top=t[i].y+"px",d=t[i].x,f=t[i].y}else o&&(e.style.display="none",t.forEach(d=>d.el.style.display="none"),o=!1),s&&(document.body.classList.remove("custom-cursor-active"),s=!1);requestAnimationFrame(c)}c()}try{B()}catch(e){console.warn(e.message)}W();X();J();window.addEventListener("keydown",e=>{if(e.shiftKey&&e.key.toLowerCase()==="f"&&!e.ctrlKey&&!e.altKey){e.preventDefault(),window.toggleFullscreen();return}if(e.shiftKey&&e.key.toLowerCase()==="l"&&!e.ctrlKey&&!e.altKey){e.preventDefault();const n=(window.location.hash||"#/stage-1").match(/stage-(\d+)/);if(n){let a=parseInt(n[1]);if(a<8){let o=a+1;Y(o),window.transitionToStage?window.transitionToStage(o):window.location.hash="#/stage-"+o}}return}if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="q"){e.preventDefault();const t=G();R(t)}});function R(e){let t=document.getElementById("dev-mode-overlay");e?t||(t=document.createElement("div"),t.id="dev-mode-overlay",t.style.cssText=`
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
            `,t.innerHTML=`
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
            `,document.body.appendChild(t)):t&&t.remove()}k()&&R(!0);function Z(){if(sessionStorage.getItem("welcomeShown"))return;const e=document.createElement("div");e.id="global-welcome-popup",e.style.cssText=`
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.95); z-index: 99999;
        display: flex; justify-content: center; align-items: center;
        flex-direction: column; color: #0f0; font-family: monospace;
        padding: 20px; text-align: center;
    `,e.innerHTML=`
        <h1 style="font-size: 36px; margin-bottom: 20px; text-shadow: 0 0 15px #0f0;">SYSTEM INITIALIZATION</h1>
        <div style="font-size: 18px; max-width: 650px; line-height: 1.8; text-align: left; background: #050505; padding: 30px; border: 2px solid #0f0; border-radius: 8px; box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);">
            <p style="margin-bottom: 15px;">> The whole game needs to be solved to get to the message.</p>
            <p style="margin-bottom: 15px;">> The game only holds in session memory, so any information or password set will not be present in the next session.</p>
            <p style="margin-bottom: 15px;">> For the best experience, we need you to go full screen.</p>
            <p style="margin-bottom: 15px;">> You can press <strong style="color: #fff; background: #333; padding: 2px 6px; border-radius: 4px;">H</strong> to get instructions of the current stage.</p>
            <p>> Please ignore any bugs if you find any :)</p>
        </div>
        <button id="btn-welcome-continue" style="margin-top: 40px; padding: 15px 40px; font-size: 22px; background: transparent; color: #0f0; border: 2px solid #0f0; cursor: pointer; font-family: monospace; font-weight: bold; text-shadow: 0 0 10px #0f0; box-shadow: 0 0 15px rgba(0,255,0,0.5); border-radius: 5px; transition: all 0.3s ease;">CONTINUE</button>
    `,document.body.appendChild(e);const t=document.getElementById("btn-welcome-continue");t.addEventListener("mouseover",()=>{t.style.background="#0f0",t.style.color="#000"}),t.addEventListener("mouseout",()=>{t.style.background="transparent",t.style.color="#0f0"}),t.addEventListener("click",()=>{sessionStorage.setItem("welcomeShown","true"),e.remove(),document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(n=>{console.warn("Fullscreen request denied or not supported:",n)})})}Z();function Q(){document.fullscreenElement?document.exitFullscreen&&document.exitFullscreen():document.documentElement.requestFullscreen().catch(e=>console.log(e))}window.toggleFullscreen=Q;export{ee as a,te as b,se as c,re as d,oe as f,ie as g,k as i,ne as s,ae as t,Y as u};
