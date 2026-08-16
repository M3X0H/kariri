import{r as I,j as K}from"./index-CZhi36UF.js";import{W as Q,S as Z,P as ee,C as x,V as te,B as N,a as v,b as oe,A as O,c as ne,F as V,L as re,d as se,G as ie,e as ae}from"./three-DeYAGWaf.js";const c=720,ce=2,le=`
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
`,de=`
  varying vec3 vColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * vFade);
  }
`;function we(){const A=I.useRef(null);return I.useEffect(()=>{const d=A.current;if(!d)return;let r;try{r=new Q({antialias:!0,alpha:!0,powerPreference:"low-power"})}catch{return}const M=new Z,f=new ee(45,1,.1,100);f.position.z=4.2,r.setPixelRatio(Math.min(window.devicePixelRatio,1.75)),r.setClearColor(0,0),d.appendChild(r.domElement),r.domElement.style.cssText="display:block;width:100%;height:100%";const C=new Float32Array(c*3),F=new Float32Array(c*3),w=new Float32Array(c*3),z=new Float32Array(c),E=new Float32Array(c),i=[],_=new x("#5ce1e6"),P=new x("#4f7cff"),$=new x("#8b5cf6"),m=new x,U=Math.PI*(3-Math.sqrt(5));for(let e=0;e<c;e++){const t=1-e/(c-1)*2,o=Math.sqrt(Math.max(0,1-t*t)),a=U*e,n=new te(Math.cos(a)*o,t,Math.sin(a)*o);i.push(n),C.set([n.x,n.y,n.z],e*3),F.set([n.x,n.y,n.z],e*3);const l=(t+1)/2;m.copy(l>.5?_.clone().lerp(P,(1-l)*2):P.clone().lerp($,1-l*2)),w.set([m.r,m.g,m.b],e*3),z[e]=Math.random()<.06?2.6+Math.random()*1.6:.5+Math.random()*.6,E[e]=Math.random()}const u=new N;u.setAttribute("position",new v(C,3)),u.setAttribute("aDir",new v(F,3)),u.setAttribute("color",new v(w,3)),u.setAttribute("aScale",new v(z,1)),u.setAttribute("aSeed",new v(E,1));const h={uSize:{value:.055},uDisperse:{value:0},uTime:{value:0}},T=new oe({uniforms:h,vertexShader:le,fragmentShader:de,transparent:!0,depthWrite:!1,blending:O,vertexColors:!0}),Y=new ne(u,T),D=[],R=[],G=new Set;for(let e=0;e<c;e++){const t=[];for(let o=0;o<c;o++){if(e===o)continue;const a=i[e].distanceToSquared(i[o]);if(t.length<ce)t.push({j:o,d:a});else{let n=0;for(let l=1;l<t.length;l++)t[l].d>t[n].d&&(n=l);a<t[n].d&&(t[n]={j:o,d:a})}}for(const{j:o}of t){const a=e<o?`${e}:${o}`:`${o}:${e}`;if(!G.has(a)){G.add(a),D.push(i[e].x,i[e].y,i[e].z,i[o].x,i[o].y,i[o].z);for(const n of[e,o])R.push(w[n*3],w[n*3+1],w[n*3+2])}}}const y=new N;y.setAttribute("position",new V(D,3)),y.setAttribute("color",new V(R,3));const g=new re({vertexColors:!0,transparent:!0,opacity:.14,blending:O,depthWrite:!1}),X=new se(y,g),p=new ie;p.add(Y,X),p.rotation.z=-.18,M.add(p);const s={x:0,y:0,tx:0,ty:0},L=e=>{e.pointerType==="mouse"&&(s.tx=e.clientX/window.innerWidth*2-1,s.ty=e.clientY/window.innerHeight*2-1)};window.addEventListener("pointermove",L,{passive:!0});let b=0;const S=()=>{const e=window.innerHeight;b=Math.min(1,Math.max(0,window.scrollY/e))};S(),window.addEventListener("scroll",S,{passive:!0});const j=()=>{const{clientWidth:e,clientHeight:t}=d;!e||!t||(r.setSize(e,t,!1),f.aspect=e/t,f.updateProjectionMatrix())};j();const B=new ResizeObserver(j);B.observe(d);let k=!0;const W=new IntersectionObserver(([e])=>{k=e.isIntersecting},{threshold:0});W.observe(d);const J=new ae;let H=0;const q=()=>{if(H=requestAnimationFrame(q),!k||document.hidden)return;const e=J.getElapsedTime();h.uTime.value=e,h.uDisperse.value+=(b*1.5-h.uDisperse.value)*.06,s.x+=(s.tx-s.x)*.045,s.y+=(s.ty-s.y)*.045,p.rotation.y=e*.055+s.x*.42,p.rotation.x=s.y*.3,p.position.y=-b*.55,g.opacity=.14*(1-b*.85),r.render(M,f)};return q(),()=>{cancelAnimationFrame(H),window.removeEventListener("pointermove",L),window.removeEventListener("scroll",S),B.disconnect(),W.disconnect(),u.dispose(),y.dispose(),T.dispose(),g.dispose(),r.dispose(),r.domElement.parentNode===d&&d.removeChild(r.domElement)}},[]),K.jsx("div",{ref:A,className:"absolute inset-0","aria-hidden":"true"})}export{we as default};
