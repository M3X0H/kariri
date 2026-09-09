import{a as re,j as be}from"./motion-BTxF_OsE.js";import{W as Ce,S as xe,P as Fe,V as ke,B as T,a as d,b as We,C as se,c as P,A as z,d as ie,F as le,L as Te,D as Pe,G as ze,e as Ne}from"./three-ipalrKx4.js";import{S as x}from"./index-BzytVSBt.js";import"./gsap-C8IefbVz.js";const F=8,Re=26,N=Re*(F-1),Ee={full:{nodes:1500,packets:90,dpr:1.75,aa:!0,reach:3},lite:{nodes:520,packets:34,dpr:1.3,aa:!1,reach:2}},ue=`
  attribute float aScale;
  attribute float aSeed;
  attribute float aWarm;
  varying vec3 vColor;
  varying float vFade;

  uniform float uTime;
  uniform float uSize;
  uniform vec3 uCool;
  uniform vec3 uSignal;
  uniform float uWarmth;
  uniform float uNear;
  uniform float uFar;

  void main() {
    /* Nothing in the corridor is ever perfectly still. The drift is
       per-node and tiny — enough that the field reads as suspended
       rather than modelled. */
    vec3 p = position;
    float ph = aSeed * 6.2831;
    p.x += sin(uTime * 0.33 + ph) * 0.075;
    p.y += cos(uTime * 0.27 + ph) * 0.075;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = -mv.z;

    /* Two fades, and both are structural. The near one stops a node
       exploding into a full-screen sprite as it passes the lens; the
       far one dissolves the corridor into the void instead of ending
       it at a visible wall. */
    vFade = smoothstep(uNear * 0.35, uNear, d) * (1.0 - smoothstep(uFar * 0.4, uFar, d));

    // The signal colour stains the field rather than replacing it.
    vColor = mix(uCool, uSignal, clamp(uWarmth * aWarm, 0.0, 1.0));

    gl_PointSize = uSize * aScale * (460.0 / max(d, 0.35));
    gl_Position = projectionMatrix * mv;
  }
`,me=`
  uniform vec2 uResolution;
  uniform float uClear;
  uniform float uAmb;
  float centreClear() {
    // Aspect-corrected, so the opening is a circle and not an ellipse
    // that goes wrong the moment the window is not 16:9.
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / max(uResolution.y, 1.0);
    /* uClear closes the hole. It stays open for the whole journey and
       shuts at the very end — because the last chapter converges the
       traffic onto the axis, which is precisely the part of the screen
       that has been kept empty since the hero. The one moment the
       centre is allowed to fill is the moment something arrives in it. */
    return mix(1.0, smoothstep(0.16, 0.44, length(p)), uClear);
  }
`,ce=`
  varying vec3 vColor;
  varying float vFade;
  ${me}

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    // Soft core, no hard rim — a hard rim is what makes a point field
    // read as dots rather than as light.
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * vFade * centreClear() * uAmb);
  }
`,de=S=>.42+.58*(.5+.5*Math.cos(S*(F-1)*Math.PI*2));function Oe({lite:S=!1}){const R=re.useRef(null);return re.useEffect(()=>{const m=R.current;if(!m)return;const{nodes:c,packets:l,dpr:he,aa:pe,reach:fe}=Ee[S?"lite":"full"];let i;try{i=new Ce({antialias:pe,alpha:!0,powerPreference:"low-power"})}catch{return}const E=new xe,r=new Fe(52,1,.1,200);r.position.set(0,0,6),r.updateMatrixWorld(),i.setPixelRatio(Math.min(window.devicePixelRatio,he)),i.setClearColor(0,0),m.appendChild(i.domElement),i.domElement.style.cssText="display:block;width:100%;height:100%";const G=new Float32Array(c*3),j=new Float32Array(c),I=new Float32Array(c),L=new Float32Array(c),u=[],ve=Math.PI*(3-Math.sqrt(5));for(let e=0;e<c;e++){const s=e/c,a=-s*N,o=ve*e,h=(7+Math.random()*13)*de(s),t=new ke(Math.cos(o)*h,Math.sin(o)*h*.72,a);u.push(t),G.set([t.x,t.y,t.z],e*3),j[e]=Math.random()<.045?2.4+Math.random()*2.2:.42+Math.random()*.5,I[e]=Math.random(),L[e]=Math.random()*Math.random()}const p=new T;p.setAttribute("position",new d(G,3)),p.setAttribute("aScale",new d(j,1)),p.setAttribute("aSeed",new d(I,1)),p.setAttribute("aWarm",new d(L,1));const n={uTime:{value:0},uSize:{value:.12},uCool:{value:new se("#5ce1e6")},uSignal:{value:new se("#e8a33d")},uWarmth:{value:0},uNear:{value:11},uFar:{value:120},uResolution:{value:new We(1,1)},uClear:{value:1},uAmb:{value:1}},O=new P({uniforms:n,vertexShader:ue,fragmentShader:ce,transparent:!0,depthWrite:!1,blending:z}),we=new ie(p,O),Ae=70,_=5.4,U=[],V=[],A=[];for(let e=0;e<c;e++){A.length=0;const s=Math.min(c,e+Ae);for(let a=e+1;a<s;a++){const o=u[e].distanceTo(u[a]);o<_&&A.push({j:a,d:o})}A.sort((a,o)=>a.d-o.d);for(let a=0;a<Math.min(fe,A.length);a++){const{j:o,d:h}=A[a],t=1-h/_;U.push(u[e].x,u[e].y,u[e].z,u[o].x,u[o].y,u[o].z),V.push(t,t)}}const M=new T;M.setAttribute("position",new le(U,3)),M.setAttribute("aAlpha",new le(V,1));const b=new P({uniforms:{uCool:n.uCool,uSignal:n.uSignal,uWarmth:n.uWarmth,uNear:n.uNear,uFar:n.uFar,uResolution:n.uResolution,uClear:n.uClear,uAmb:n.uAmb,uOpacity:{value:.5}},vertexShader:`
        attribute float aAlpha;
        varying float vA;
        uniform float uNear;
        uniform float uFar;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float d = -mv.z;
          vA = aAlpha
             * smoothstep(uNear * 0.35, uNear, d)
             * (1.0 - smoothstep(uFar * 0.32, uFar * 0.8, d));
          gl_Position = projectionMatrix * mv;
        }
      `,fragmentShader:`
        varying float vA;
        uniform vec3 uCool;
        uniform vec3 uSignal;
        uniform float uWarmth;
        uniform float uOpacity;
        ${me}
        void main() {
          gl_FragColor = vec4(mix(uCool, uSignal, uWarmth * 0.55), vA * uOpacity * centreClear() * uAmb);
        }
      `,transparent:!0,depthWrite:!1,blending:z}),ge=new Te(M,b),C=new Float32Array(l*3),B=new Float32Array(l),D=new Float32Array(l),q=new Float32Array(l),g=new Float32Array(l),H=new Float32Array(l),$=new Float32Array(l),K=new Float32Array(l);for(let e=0;e<l;e++)g[e]=Math.random(),H[e]=.012+Math.random()*.03,$[e]=Math.random()*Math.PI*2,K[e]=5+Math.random()*13,B[e]=1.5+Math.random()*1.5,D[e]=Math.random(),q[e]=.35+Math.random()*.65;const f=new T,k=new d(C,3);k.setUsage(Pe),f.setAttribute("position",k),f.setAttribute("aScale",new d(B,1)),f.setAttribute("aSeed",new d(D,1)),f.setAttribute("aWarm",new d(q,1));const v=new P({uniforms:{...n,uSize:{value:.17},uClear:{value:1},uAmb:n.uAmb},vertexShader:ue,fragmentShader:ce,transparent:!0,depthWrite:!1,blending:z}),ye=new ie(f,v),Q=new ze;Q.add(we,ge,ye),E.add(Q);const X=()=>{const e=m.clientWidth,s=m.clientHeight;if(!e||!s)return;i.setSize(e,s,!1),r.aspect=e/s,r.updateProjectionMatrix();const a=i.getPixelRatio();n.uResolution.value.set(e*a,s*a)};X();const Y=new ResizeObserver(X);Y.observe(m);const Se=new Ne;let J=0,w=0,y=0;const Z=1/(F-1),ee=2/(F-1);let W=1;const te=()=>{if(J=requestAnimationFrame(te),document.hidden)return;const e=Se.getElapsedTime();n.uTime.value=e,v.uniforms.uTime.value=e,w+=(x.scroll-w)*.075,r.position.z=6-w*N*.9,r.position.x=x.pxc*2.6,r.position.y=-x.pyc*1.9+Math.sin(e*.16)*.8,r.lookAt(r.position.x*.35,r.position.y*.35,r.position.z-26),r.rotation.z+=x.vel*.05+Math.sin(e*.11)*.012;const s=1-Math.min(1,Math.abs(w-Z)/(Z*.85));y+=(s*s-y)*.05,n.uWarmth.value=y,v.uniforms.uWarmth.value=y,b.uniforms.uWarmth.value=y;const a=Math.max(0,(w-.84)/.16),o=a*a,h=1-Math.min(1,Math.abs(w-ee)/(ee*.55));W+=(1-.62*h*h-W)*.05,n.uAmb.value=W;for(let t=0;t<l;t++){g[t]+=H[t]*(.016+o*.05),g[t]>1&&(g[t]-=1);const ae=g[t],Me=de(ae),oe=$[t]+e*.05,ne=K[t]*Me*(1-o*.82);C[t*3]=Math.cos(oe)*ne,C[t*3+1]=Math.sin(oe)*ne*.72,C[t*3+2]=-ae*N}k.needsUpdate=!0,v.uniforms.uSize.value=.17+o*.14,v.uniforms.uClear.value=1-o*.92,b.uniforms.uOpacity.value=.5+o*.18,i.render(E,r)};return te(),()=>{cancelAnimationFrame(J),Y.disconnect(),p.dispose(),M.dispose(),f.dispose(),O.dispose(),b.dispose(),v.dispose(),i.dispose(),i.domElement.parentNode===m&&m.removeChild(i.domElement)}},[S]),be.jsx("div",{ref:R,className:"system-scene","aria-hidden":"true"})}export{Oe as default};
