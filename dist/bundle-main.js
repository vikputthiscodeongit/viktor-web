(()=>{"use strict";const e=e=>Array.isArray(e),t=t=>e(t)?t:[t];const n=e=>Array.from(e),r=e=>document.createTextNode(e);let a=e=>([...e.childNodes].forEach((e=>{if(e.nodeValue)return[...e.nodeValue].forEach((t=>{e.parentNode.insertBefore(r(t),e)})),void e.remove();a(e)})),e);const i=e=>{let t=document.implementation.createHTMLDocument();return t.body.innerHTML=e,a(t.body)},o="data-typeit-id",s="ti-cursor",l={started:!1,completed:!1,frozen:!1,destroyed:!1},u={breakLines:!0,cursor:{autoPause:!0,autoPauseDelay:500,animation:{frames:[0,0,1].map((e=>({opacity:e}))),options:{iterations:1/0,easing:"steps(2, start)",fill:"forwards"}}},cursorChar:"|",cursorSpeed:1e3,deleteSpeed:null,html:!0,lifeLike:!0,loop:!1,loopDelay:750,nextStringDelay:750,speed:100,startDelay:250,startDelete:!1,strings:[],waitUntilVisible:!1,beforeString:()=>{},afterString:()=>{},beforeStep:()=>{},afterStep:()=>{},afterComplete:()=>{}},d=`[${o}]:before {content: '.'; display: inline-block; width: 0; visibility: hidden;}`;function c(e,t=!1,n=!1){let r,a=e.querySelector(`.${s}`),i=document.createTreeWalker(e,NodeFilter.SHOW_ALL,{acceptNode:e=>{if(a&&n){if(e.classList?.contains(s))return NodeFilter.FILTER_ACCEPT;if(a.contains(e))return NodeFilter.FILTER_REJECT}return e.classList?.contains(s)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),o=[];for(;r=i.nextNode();)r.originalParent||(r.originalParent=r.parentNode),o.push(r);return t?o.reverse():o}function f(e,t=!0){return t?c(i(e)):n(e).map(r)}const y=e=>document.createElement(e),p=(e,t="")=>{let n=y("style");n.id=t,n.appendChild(r(e)),document.head.appendChild(n)},h=t=>(e(t)||(t=[t/2,t/2]),t),m=(e,t)=>Math.abs(Math.random()*(e+t-(e-t))+(e-t));let g=e=>e/2;const b=e=>"value"in e;let w=e=>"function"==typeof e?e():e;const v=e=>Number.isInteger(e);let T=(e,t=document,n=!1)=>t["querySelector"+(n?"All":"")](e);const E=(e,t)=>Object.assign({},e,t);let L={"font-family":"","font-weight":"","font-size":"","font-style":"","line-height":"",color:"",transform:"translateX(-.125em)"};const S=(e,t)=>new Array(t).fill(e),P=({queueItems:e,selector:t,cursorPosition:n,to:r})=>{if(v(t))return-1*t;let a=new RegExp("END","i").test(r),i=t?[...e].reverse().findIndex((({char:e})=>{let n=e.parentElement,r=n.matches(t);return!(!a||!r)||r&&n.firstChild.isSameNode(e)})):-1;return i<0&&(i=a?0:e.length-1),i-n+(a?0:1)};let N=e=>new Promise((t=>{requestAnimationFrame((async()=>{t(await e())}))})),C=e=>e?.getAnimations().find((t=>t.id===e.dataset.tiAnimationId)),D=({cursor:e,frames:t,options:n})=>{let r=e.animate(t,n);return r.pause(),r.id=e.dataset.tiAnimationId,N((()=>{N((()=>{r.play()}))})),r},M=e=>e.func?.call(null),I=async({index:e,queueItems:t,wait:n,cursor:r,cursorOptions:a})=>{let i=t[e][1],o=[],s=e,l=i,u=()=>l&&!l.delay,d=i.shouldPauseCursor()&&a.autoPause;for(;u();)o.push(l),u()&&s++,l=t[s]?t[s][1]:null;if(o.length)return await N((async()=>{for(let e of o)await M(e)})),s-1;let c,f=C(r);return f&&(c={...f.effect.getComputedTiming(),delay:d?a.autoPauseDelay:0}),await n((async()=>{f&&d&&f.cancel(),await N((()=>{M(i)}))}),i.delay),await(({cursor:e,options:t,cursorOptions:n})=>{if(!e||!n)return;let r,a=C(e);a&&(t.delay=a.effect.getComputedTiming().delay,r=a.currentTime,a.cancel());let i=D({cursor:e,frames:n.animation.frames,options:t});return r&&(i.currentTime=r),i})({cursor:r,options:c,cursorOptions:a}),e};const A=function(e,r={}){let N=async(e,t,n=!1)=>{K.frozen&&await new Promise((e=>{this.unfreeze=()=>{K.frozen=!1,e()}})),n||await Y.beforeStep(this),await((e,t,n)=>new Promise((r=>{n.push(setTimeout((async()=>{await e(),r()}),t||0))})))(e,t,U),n||await Y.afterStep(this)},C=(e,t)=>I({index:e,queueItems:t,wait:N,cursor:ne,cursorOptions:Y.cursor}),M=e=>((e,t)=>{if(!e)return;let n=e.parentNode;(n.childNodes.length>1||n.isSameNode(t)?e:n).remove()})(e,W),A=()=>b(W),x=(e=0)=>function(e){let{speed:t,deleteSpeed:n,lifeLike:r}=e;return n=null!==n?n:t/3,r?[m(t,g(t)),m(n,g(n))]:[t,n]}(Y)[e],$=()=>(e=>b(e)?n(e.value):c(e,!0).filter((e=>!(e.childNodes.length>0))))(W),H=(e,t)=>(ee.add(e),((e={})=>{let t=e.delay;t&&ee.add({delay:t})})(t),this),k=()=>G??X,O=(e={})=>[{func:()=>j(e)},{func:()=>j(Y)}],F=e=>{let t=Y.nextStringDelay;ee.add([{delay:t[0]},...e,{delay:t[1]}])},q=async()=>{if(!A()&&ne&&W.appendChild(ne),te){((e,t)=>{let n=`[${o}='${e}'] .${s}`,r=getComputedStyle(t),a=Object.entries(L).reduce(((e,[t,n])=>`${e} ${t}: var(--ti-cursor-${t}, ${n||r[t]});`),"");p(`${n} { display: inline-block; width: 0; ${a} }`,e)})(Z,W),ne.dataset.tiAnimationId=Z;let{animation:e}=Y.cursor,{frames:t,options:n}=e;D({frames:t,cursor:ne,options:{duration:Y.cursorSpeed,...n}})}},R=()=>{let e=Y.strings.filter((e=>!!e));e.forEach(((t,n)=>{if(this.type(t),n+1===e.length)return;let r=Y.breakLines?[{func:()=>_(y("BR")),typeable:!0}]:S({func:Q,delay:x(1)},ee.getTypeable().length);F(r)}))},z=async(e=!0)=>{K.started=!0;let t=t=>{ee.done(t,!e)};try{let n=[...ee.getQueue()];for(let e=0;e<n.length;e++){let[r,a]=n[e];if(!a.done){if(!a.deletable||a.deletable&&$().length){let r=await C(e,n);Array(r-e).fill(e+1).map(((e,t)=>e+t)).forEach((e=>{let[r]=n[e];t(r)})),e=r}t(r)}}if(!e)return this;if(K.completed=!0,await Y.afterComplete(this),!Y.loop)throw"";let r=Y.loopDelay;N((async()=>{await(async e=>{let t=k();t&&await B({value:t});let n=$().map((e=>[Symbol(),{func:Q,delay:x(1),deletable:!0,shouldPauseCursor:()=>!0}]));for(let e=0;e<n.length;e++)await C(e,n);ee.reset(),ee.set(0,{delay:e})})(r[0]),z()}),r[1])}catch(e){}return this},B=async e=>{var t,n,r;t=e,n=X,r=$(),X=Math.min(Math.max(n+t,0),r.length),((e,t,n)=>{let r=t[n-1],a=T(`.${s}`,e);(e=r?.parentNode||e).insertBefore(a,r||null)})(W,$(),X)},_=e=>((e,t)=>{if(b(e))return void(e.value=`${e.value}${t.textContent}`);t.innerHTML="";let n=(r=t.originalParent,/body/i.test(r?.tagName)?e:t.originalParent||e);var r;n.insertBefore(t,T("."+s,n)||null)})(W,e),j=async e=>Y=E(Y,e),V=async()=>{A()?W.value="":$().forEach(M)},Q=()=>{let e=$();e.length&&(A()?W.value=W.value.slice(0,-1):M(e[X]))};this.break=function(e){return H({func:()=>_(y("BR")),typeable:!0},e)},this.delete=function(e=null,t={}){e=w(e);let n=O(t),r=e,{instant:a,to:i}=t,o=ee.getTypeable(),s=null===r?o.length:v(r)?r:P({queueItems:o,selector:r,cursorPosition:k(),to:i});return H([n[0],...S({func:Q,delay:a?0:x(1),deletable:!0},s),n[1]],t)},this.empty=function(e={}){return H({func:V},e)},this.exec=function(e,t={}){let n=O(t);return H([n[0],{func:()=>e(this)},n[1]],t)},this.move=function(e,t={}){e=w(e);let n=O(t),{instant:r,to:a}=t,i=P({queueItems:ee.getTypeable(),selector:null===e?"":e,to:a,cursorPosition:k()}),o=i<0?-1:1;return G=k()+i,H([n[0],...S({func:()=>B(o),delay:r?0:x(),cursorable:!0},Math.abs(i)),n[1]],t)},this.options=function(e,t={}){return e=w(e),j(e),H({},t)},this.pause=function(e,t={}){return H({delay:w(e)},t)},this.type=function(e,t={}){e=w(e);let{instant:n}=t,r=O(t),a=f(e,Y.html).map((e=>{return{func:()=>_(e),char:e,delay:n||(t=e,/<(.+)>(.*?)<\/(.+)>/.test(t.outerHTML))?0:x(),typeable:e.nodeType===Node.TEXT_NODE};var t})),i=[r[0],{func:async()=>await Y.beforeString(e,this)},...a,{func:async()=>await Y.afterString(e,this)},r[1]];return H(i,t)},this.is=function(e){return K[e]},this.destroy=function(e=!0){U.forEach(clearTimeout),U=[],w(e)&&ne&&M(ne),K.destroyed=!0},this.freeze=function(){K.frozen=!0},this.unfreeze=()=>{},this.reset=function(e){!this.is("destroyed")&&this.destroy(),e?(ee.wipe(),e(this)):ee.reset(),X=0;for(let e in K)K[e]=!1;return W[A()?"value":"innerHTML"]="",this},this.go=function(){return K.started?this:(q(),Y.waitUntilVisible?(((e,t)=>{new IntersectionObserver(((n,r)=>{n.forEach((n=>{n.isIntersecting&&(t(),r.unobserve(e))}))}),{threshold:1}).observe(e)})(W,z.bind(this)),this):(z(),this))},this.flush=function(e=(()=>{})){return q(),z(!1).then(e),this},this.getQueue=()=>ee,this.getOptions=()=>Y,this.updateOptions=e=>j(e),this.getElement=()=>W;let W="string"==typeof(J=e)?T(J):J;var J;let U=[],X=0,G=null,K=E({},l);r.cursor=(e=>{if("object"==typeof e){let t={},{frames:n,options:r}=u.cursor.animation;return t.animation=e.animation||{},t.animation.frames=e.animation?.frames||n,t.animation.options=E(r,e.animation?.options||{}),t.autoPause=e.autoPause??u.cursor.autoPause,t.autoPauseDelay=e.autoPauseDelay||u.cursor.autoPauseDelay,t}return!0===e?u.cursor:e})(r.cursor??u.cursor);let Y=E(u,r);Y=E(Y,{html:!A()&&Y.html,nextStringDelay:h(Y.nextStringDelay),loopDelay:h(Y.loopDelay)});let Z=Math.random().toString().substring(2,9),ee=function(e){let n=function(e){return t(e).forEach((e=>i.set(Symbol(e.char?.innerText),r({...e})))),this},r=e=>(e.shouldPauseCursor=function(){return Boolean(this.typeable||this.cursorable||this.deletable)},e),a=()=>Array.from(i.values()),i=new Map;return n(e),{add:n,set:function(e,t){let n=[...i.keys()];i.set(n[e],r(t))},wipe:function(){i=new Map,n(e)},reset:function(){i.forEach((e=>delete e.done))},destroy:e=>i.delete(e),done:(e,t=!1)=>t?i.delete(e):i.get(e).done=!0,getItems:(e=!1)=>e?a():a().filter((e=>!e.done)),getQueue:()=>i,getTypeable:()=>a().filter((e=>e.typeable))}}([{delay:Y.startDelay}]);W.dataset.typeitId=Z,p(d);let te=!!Y.cursor&&!A(),ne=(()=>{if(A())return;let e=y("span");return e.className=s,te?(e.innerHTML=i(Y.cursorChar).innerHTML,e):(e.style.visibility="hidden",e)})();Y.strings=(e=>{let t=W.innerHTML;return t?(W.innerHTML="",Y.startDelete?(W.innerHTML=t,a(W),F(S({func:Q,delay:x(1),deletable:!0},$().length)),e):t.replace(/<!--(.+?)-->/g,"").trim().split(/<br(?:\s*?)(?:\/)?>/).concat(e)):e})(t(Y.strings)),Y.strings.length&&R()};document.documentElement.classList.replace("no-js","js"),function(e){e.addEventListener("mousedown",(()=>e.classList.add("using-mouse"))),e.addEventListener("keydown",(()=>e.classList.remove("using-mouse")))}(document.body),function(e){new A(e,{speed:75,deleteSpeed:40,loop:!0}).type("Photographer",{delay:1800}).delete(null,{delay:1e3}).type("Web devlo",{delay:500}).move(-2,{speed:150,delay:350}).type("e",{delay:500}).move(2,{speed:100,delay:400}).type("per",{delay:1850}).delete(null,{delay:1e3}).type("Moti",{delay:400}).delete(2,{speed:120,delay:350}).type("toring enthusiast",{delay:2e3}).delete(null,{delay:900}).type("Human",{delay:1450}).delete(null,{delay:900}).go()}(document.querySelector(".viktor-about--typeit > span"))})();
//# sourceMappingURL=bundle-main.js.map