import{a as de,j as Fe}from"./motion-BTxF_OsE.js";import{W as ze,S as Ee,P as Pe,C as z,V as ke,B as E,a as u,c as ue,A as P,d as pe,F as k,f as we,L as fe,D as De,G as Te,e as Ge}from"./three-ipalrKx4.js";const Le=2,Re={full:{count:700,dpr:1.75,spokes:22,aa:!0},lite:{count:300,dpr:1.25,spokes:12,aa:!1}},x=.36,he=`
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
`,me=`
  varying vec3 vColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * vFade);
  }
`;function Be({lite:j=!1}){const B=de.useRef(null);return de.useEffect(()=>{const{count:a,dpr:ve,spokes:I,aa:ye}=Re[j?"lite":"full"],w=B.current;if(!w)return;let c;try{c=new ze({antialias:ye,alpha:!0,powerPreference:"low-power"})}catch{return}const N=new Ee,g=new Pe(45,1,.1,100);g.position.z=4.2,c.setPixelRatio(Math.min(window.devicePixelRatio,ve)),c.setClearColor(0,0),w.appendChild(c.domElement),c.domElement.style.cssText="display:block;width:100%;height:100%";const U=new Float32Array(a*3),H=new Float32Array(a*3),i=new Float32Array(a*3),O=new Float32Array(a),q=new Float32Array(a),r=[],be=new z("#5ce1e6"),V=new z("#4f7cff"),xe=new z("#8b5cf6"),A=new z,ge=Math.PI*(3-Math.sqrt(5));for(let e=0;e<a;e++){const t=1-e/(a-1)*2,o=Math.sqrt(Math.max(0,1-t*t)),n=ge*e,s=new ke(Math.cos(n)*o,t,Math.sin(n)*o);r.push(s),U.set([s.x,s.y,s.z],e*3),H.set([s.x,s.y,s.z],e*3);const l=(t+1)/2;A.copy(l>.5?be.clone().lerp(V,(1-l)*2):V.clone().lerp(xe,1-l*2)),i.set([A.r,A.g,A.b],e*3),O[e]=Math.random()<.06?2.6+Math.random()*1.6:.5+Math.random()*.6,q[e]=Math.random()}const f=new E;f.setAttribute("position",new u(U,3)),f.setAttribute("aDir",new u(H,3)),f.setAttribute("color",new u(i,3)),f.setAttribute("aScale",new u(O,1)),f.setAttribute("aSeed",new u(q,1));const v={uSize:{value:.055},uDisperse:{value:0},uTime:{value:0}},_=new ue({uniforms:v,vertexShader:he,fragmentShader:me,transparent:!0,depthWrite:!1,blending:P,vertexColors:!0}),Ae=new pe(f,_),$=[],Y=[],K=new Set;for(let e=0;e<a;e++){const t=[];for(let o=0;o<a;o++){if(e===o)continue;const n=r[e].distanceToSquared(r[o]);if(t.length<Le)t.push({j:o,d:n});else{let s=0;for(let l=1;l<t.length;l++)t[l].d>t[s].d&&(s=l);n<t[s].d&&(t[s]={j:o,d:n})}}for(const{j:o}of t){const n=e<o?`${e}:${o}`:`${o}:${e}`;if(!K.has(n)){K.add(n),$.push(r[e].x,r[e].y,r[e].z,r[o].x,r[o].y,r[o].z);for(const s of[e,o])Y.push(i[s*3],i[s*3+1],i[s*3+2])}}}const S=new E;S.setAttribute("position",new k($,3)),S.setAttribute("color",new k(Y,3));const D=new we({vertexColors:!0,transparent:!0,opacity:.13,blending:P,depthWrite:!1}),Se=new fe(S,D),T=[],Q=[],X=[],J=Math.floor(a/I);for(let e=0;e<I;e++){const t=(e*J+e*37%J)%a;T.push(t);const o=r[t];Q.push(o.x*x,o.y*x,o.z*x,o.x,o.y,o.z);const[n,s,l]=[i[t*3],i[t*3+1],i[t*3+2]];X.push(n*.04,s*.04,l*.04,n,s,l)}const M=new E;M.setAttribute("position",new k(Q,3)),M.setAttribute("color",new k(X,3));const G=new we({vertexColors:!0,transparent:!0,opacity:.5,blending:P,depthWrite:!1}),Me=new fe(M,G),p=T.length,C=new Float32Array(p*3),y=new Float32Array(p*3),Z=new Float32Array(p*3),ee=new Float32Array(p),L=new Float32Array(p),b=new Float32Array(p);for(let e=0;e<p;e++){const t=T[e];y.set([r[t].x,r[t].y,r[t].z],e*3),Z.set([i[t*3],i[t*3+1],i[t*3+2]],e*3),ee[e]=1.5+Math.random()*.9,L[e]=Math.random(),b[e]=Math.random()}const h=new E,R=new u(C,3);R.setUsage(De),h.setAttribute("position",R),h.setAttribute("aDir",new u(y,3)),h.setAttribute("color",new u(Z,3)),h.setAttribute("aScale",new u(ee,1)),h.setAttribute("aSeed",new u(L,1));const te=new ue({uniforms:v,vertexShader:he,fragmentShader:me,transparent:!0,depthWrite:!1,blending:P,vertexColors:!0}),Ce=new pe(h,te),m=new Te;m.add(Ae,Se,Me,Ce),m.rotation.z=-.18,N.add(m);const d={x:0,y:0,tx:0,ty:0},oe=e=>{e.pointerType==="mouse"&&(d.tx=e.clientX/window.innerWidth*2-1,d.ty=e.clientY/window.innerHeight*2-1)};window.addEventListener("pointermove",oe,{passive:!0});let F=0;const W=()=>{const e=window.innerHeight;F=Math.min(1,Math.max(0,window.scrollY/e))};W(),window.addEventListener("scroll",W,{passive:!0});const ne=()=>{const{clientWidth:e,clientHeight:t}=w;!e||!t||(c.setSize(e,t,!1),g.aspect=e/t,g.updateProjectionMatrix())};ne();const se=new ResizeObserver(ne);se.observe(w);let re=!0;const ae=new IntersectionObserver(([e])=>{re=e.isIntersecting},{threshold:0});ae.observe(w);const ie=new Ge;let le=0;const ce=()=>{if(le=requestAnimationFrame(ce),!re||document.hidden)return;const e=Math.min(ie.getDelta(),.05),t=ie.getElapsedTime();v.uTime.value=t,v.uDisperse.value+=(F*1.5-v.uDisperse.value)*.06;for(let n=0;n<p;n++){b[n]+=e*(.16+L[n]*.2),b[n]>1&&(b[n]-=1);const s=x+(1-x)*b[n];C[n*3]=y[n*3]*s,C[n*3+1]=y[n*3+1]*s,C[n*3+2]=y[n*3+2]*s}R.needsUpdate=!0,d.x+=(d.tx-d.x)*.045,d.y+=(d.ty-d.y)*.045,m.rotation.y=t*.055+d.x*.42,m.rotation.x=d.y*.3,m.position.y=-F*.55;const o=1-F*.85;D.opacity=.13*o,G.opacity=.5*o,c.render(N,g)};return ce(),()=>{cancelAnimationFrame(le),window.removeEventListener("pointermove",oe),window.removeEventListener("scroll",W),se.disconnect(),ae.disconnect(),f.dispose(),S.dispose(),M.dispose(),h.dispose(),_.dispose(),D.dispose(),G.dispose(),te.dispose(),c.dispose(),c.domElement.parentNode===w&&w.removeChild(c.domElement)}},[j]),Fe.jsx("div",{ref:B,className:"absolute inset-0","aria-hidden":"true"})}export{Be as default};
