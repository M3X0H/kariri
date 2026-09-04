import{a as N,j as Z}from"./motion-BTxF_OsE.js";import{W as ee,S as te,P as oe,C as x,V as ne,B as O,a as w,b as re,A as V,c as se,F as _,L as ie,d as ae,G as ce,e as le}from"./three-DeYAGWaf.js";const de=2,ue={full:{count:720,dpr:1.75},lite:{count:340,dpr:1.25}},pe=`
  attribute vec3 aDir;
  attribute float aScale;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vFade;
  uniform float uSize;
  uniform float uDisperse;
  uniform float uTime;

  void main() {
    vColor = color;
    // A slow breath, plus the scroll-driven push along each point's
    // own outward vector.
    float breath = 1.0 + sin(uTime * 0.6 + aSeed * 6.2831) * 0.012;
    vec3 p = position * breath + aDir * uDisperse;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vFade = 1.0 - uDisperse * 0.55;
    gl_PointSize = uSize * aScale * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`,fe=`
  varying vec3 vColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * vFade);
  }
`;function me({lite:S=!1}){const M=N.useRef(null);return N.useEffect(()=>{const{count:i,dpr:$}=ue[S?"lite":"full"],d=M.current;if(!d)return;let r;try{r=new ee({antialias:!0,alpha:!0,powerPreference:"low-power"})}catch{return}const C=new te,v=new oe(45,1,.1,100);v.position.z=4.2,r.setPixelRatio(Math.min(window.devicePixelRatio,$)),r.setClearColor(0,0),d.appendChild(r.domElement),r.domElement.style.cssText="display:block;width:100%;height:100%";const F=new Float32Array(i*3),z=new Float32Array(i*3),f=new Float32Array(i*3),E=new Float32Array(i),P=new Float32Array(i),a=[],U=new x("#5ce1e6"),T=new x("#4f7cff"),Y=new x("#8b5cf6"),m=new x,Q=Math.PI*(3-Math.sqrt(5));for(let e=0;e<i;e++){const t=1-e/(i-1)*2,o=Math.sqrt(Math.max(0,1-t*t)),c=Q*e,n=new ne(Math.cos(c)*o,t,Math.sin(c)*o);a.push(n),F.set([n.x,n.y,n.z],e*3),z.set([n.x,n.y,n.z],e*3);const l=(t+1)/2;m.copy(l>.5?U.clone().lerp(T,(1-l)*2):T.clone().lerp(Y,1-l*2)),f.set([m.r,m.g,m.b],e*3),E[e]=Math.random()<.06?2.6+Math.random()*1.6:.5+Math.random()*.6,P[e]=Math.random()}const u=new O;u.setAttribute("position",new w(F,3)),u.setAttribute("aDir",new w(z,3)),u.setAttribute("color",new w(f,3)),u.setAttribute("aScale",new w(E,1)),u.setAttribute("aSeed",new w(P,1));const h={uSize:{value:.055},uDisperse:{value:0},uTime:{value:0}},D=new re({uniforms:h,vertexShader:pe,fragmentShader:fe,transparent:!0,depthWrite:!1,blending:V,vertexColors:!0}),X=new se(u,D),L=[],R=[],G=new Set;for(let e=0;e<i;e++){const t=[];for(let o=0;o<i;o++){if(e===o)continue;const c=a[e].distanceToSquared(a[o]);if(t.length<de)t.push({j:o,d:c});else{let n=0;for(let l=1;l<t.length;l++)t[l].d>t[n].d&&(n=l);c<t[n].d&&(t[n]={j:o,d:c})}}for(const{j:o}of t){const c=e<o?`${e}:${o}`:`${o}:${e}`;if(!G.has(c)){G.add(c),L.push(a[e].x,a[e].y,a[e].z,a[o].x,a[o].y,a[o].z);for(const n of[e,o])R.push(f[n*3],f[n*3+1],f[n*3+2])}}}const y=new O;y.setAttribute("position",new _(L,3)),y.setAttribute("color",new _(R,3));const g=new ie({vertexColors:!0,transparent:!0,opacity:.14,blending:V,depthWrite:!1}),J=new ae(y,g),p=new ce;p.add(X,J),p.rotation.z=-.18,C.add(p);const s={x:0,y:0,tx:0,ty:0},j=e=>{e.pointerType==="mouse"&&(s.tx=e.clientX/window.innerWidth*2-1,s.ty=e.clientY/window.innerHeight*2-1)};window.addEventListener("pointermove",j,{passive:!0});let b=0;const A=()=>{const e=window.innerHeight;b=Math.min(1,Math.max(0,window.scrollY/e))};A(),window.addEventListener("scroll",A,{passive:!0});const B=()=>{const{clientWidth:e,clientHeight:t}=d;!e||!t||(r.setSize(e,t,!1),v.aspect=e/t,v.updateProjectionMatrix())};B();const k=new ResizeObserver(B);k.observe(d);let W=!0;const H=new IntersectionObserver(([e])=>{W=e.isIntersecting},{threshold:0});H.observe(d);const K=new le;let I=0;const q=()=>{if(I=requestAnimationFrame(q),!W||document.hidden)return;const e=K.getElapsedTime();h.uTime.value=e,h.uDisperse.value+=(b*1.5-h.uDisperse.value)*.06,s.x+=(s.tx-s.x)*.045,s.y+=(s.ty-s.y)*.045,p.rotation.y=e*.055+s.x*.42,p.rotation.x=s.y*.3,p.position.y=-b*.55,g.opacity=.14*(1-b*.85),r.render(C,v)};return q(),()=>{cancelAnimationFrame(I),window.removeEventListener("pointermove",j),window.removeEventListener("scroll",A),k.disconnect(),H.disconnect(),u.dispose(),y.dispose(),D.dispose(),g.dispose(),r.dispose(),r.domElement.parentNode===d&&d.removeChild(r.domElement)}},[S]),Z.jsx("div",{ref:M,className:"absolute inset-0","aria-hidden":"true"})}export{me as default};
