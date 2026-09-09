import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SIGNAL } from '../lib/signals';

/* ═══════════════════════════════════════════════════════════════
   THE TRACE — one space, one camera, the whole page.

   The site used to be eight rooms with a canvas in two of them. This
   is the corridor all eight are cut into: a single volume of nodes and
   links that the camera flies down as you scroll, from the hero at one
   end to the transmission at the other. Nothing here fades a section
   in or out — you simply arrive somewhere and leave it, which is the
   difference between a page that transitions and a page that travels.

   The tube's radius breathes with the station rhythm: widest where a
   chapter sits, so the axis is open and the type has quiet behind it,
   and pinched between them, so a section change is a throat you pass
   through rather than a cut. That is the whole transition language,
   and it costs one cosine.

   It is behind everything, `pointer-events: none`, `aria-hidden`, and
   fixed — which also means it is structurally incapable of widening
   the document, whatever it draws. Fixed boxes are excluded from the
   viewport's scrollable overflow, so the horizontal-shift class of bug
   cannot originate here.
   ═══════════════════════════════════════════════════════════════ */

/* Eight chapters, so eight chambers. The camera covers the whole run
   over the document's scroll, so this is a shape, not a speed. */
const STATIONS = 8;
const SPAN = 26;
const LENGTH = SPAN * (STATIONS - 1);

/* Phones draw the same corridor with a third of the nodes and no
   antialiasing. The shape survives; the fill cost does not. */
const QUALITY = {
  full: { nodes: 1500, packets: 90, dpr: 1.75, aa: true, reach: 3 },
  lite: { nodes: 520, packets: 34, dpr: 1.3, aa: false, reach: 2 }
} as const;

const VERT = /* glsl */ `
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
`;

/* Flying down a tube puts the most geometry exactly where the vanishing
   point is — which is the middle of the screen, which is where the
   reading is. So the corridor is cleared from the centre outward in
   screen space: it opens around the type instead of running through it.

   This is a hole in the image, not a reduction in opacity. Dimming the
   whole field to protect the middle costs the edges the density that
   makes it read as a volume at all; this keeps the edges rich and the
   middle empty, which is also simply how a lens behaves. */
const CLEAR = /* glsl */ `
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
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;
  ${CLEAR}

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    // Soft core, no hard rim — a hard rim is what makes a point field
    // read as dots rather than as light.
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * vFade * centreClear() * uAmb);
  }
`;

/* Where the tube is wide and where it pinches. 1 at a station, ~0.42
   at the throat between two. */
const gauge = (t: number) => 0.42 + 0.58 * (0.5 + 0.5 * Math.cos(t * (STATIONS - 1) * Math.PI * 2));

export default function SystemScene({ lite = false }: { lite?: boolean }) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = holder.current;
    if (!mount) return;

    const { nodes: COUNT, packets: PACKETS, dpr, aa, reach } = QUALITY[lite ? 'lite' : 'full'];

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: aa, alpha: true, powerPreference: 'low-power' });
    } catch {
      return; // No WebGL. The page is designed to be complete without it.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 200);
    camera.position.set(0, 0, 6);
    camera.updateMatrixWorld();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

    /* ── the corridor ─────────────────────────────────────────── */
    const pos = new Float32Array(COUNT * 3);
    const scale = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const warm = new Float32Array(COUNT);
    const pts: THREE.Vector3[] = [];

    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      const z = -t * LENGTH;

      /* Distributed on a shell rather than through the volume: a solid
         core of nodes on the axis is what the camera flies straight
         into, and it is exactly where the type has to stay readable. */
      const a = golden * i;
      const r = (7 + Math.random() * 13) * gauge(t);

      const v = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.72, z);
      pts.push(v);
      pos.set([v.x, v.y, v.z], i * 3);

      // A few hubs, mostly motes. The ratio is what gives the field a
      // read at all — a uniform size is noise.
      scale[i] = Math.random() < 0.045 ? 2.4 + Math.random() * 2.2 : 0.42 + Math.random() * 0.5;
      seed[i] = Math.random();
      warm[i] = Math.random() * Math.random(); // biased low: the stain is sparse
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    nodeGeo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    nodeGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    nodeGeo.setAttribute('aWarm', new THREE.BufferAttribute(warm, 1));

    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: 0.12 },
      uCool: { value: new THREE.Color('#5ce1e6') },
      uSignal: { value: new THREE.Color('#e8a33d') },
      uWarmth: { value: 0 },
      /* Nothing within `uNear` is drawn at all. The corridor is a
         distance, and geometry that gets close enough to subtend a
         large angle stops reading as depth and starts reading as a
         line across the screen. */
      uNear: { value: 11 },
      uFar: { value: 120 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uClear: { value: 1 },
      uAmb: { value: 1 }
    };

    const nodeMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const nodes = new THREE.Points(nodeGeo, nodeMat);

    /* ── the links ────────────────────────────────────────────── */
    /* Nodes are ordered along z, but their angle comes from the golden
       lattice — so consecutive entries in the array sit a third of a
       turn apart. Stitching neighbours by index therefore draws chords
       straight across the tube, and the field reads as scratches on the
       lens rather than as a structure.

       So: search a window of the nearest entries in z (all of which are
       close along the corridor) and keep only the genuinely nearest few
       in space. It is O(n·window) once at build time, and it is the
       difference between a lattice and a scribble. */
    const WINDOW = 70;
    const MAX = 5.4;
    const linkPos: number[] = [];
    const linkAlpha: number[] = [];
    const near: { j: number; d: number }[] = [];

    for (let i = 0; i < COUNT; i++) {
      near.length = 0;
      const end = Math.min(COUNT, i + WINDOW);
      for (let j = i + 1; j < end; j++) {
        const d = pts[i].distanceTo(pts[j]);
        if (d < MAX) near.push({ j, d });
      }
      near.sort((a, b) => a.d - b.d);

      for (let k = 0; k < Math.min(reach, near.length); k++) {
        const { j, d } = near[k];
        // Long links are dimmer, so the mesh thins out instead of
        // turning into a solid web wherever nodes happen to bunch.
        const a = 1 - d / MAX;
        linkPos.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        linkAlpha.push(a, a);
      }
    }

    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPos, 3));
    linkGeo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(linkAlpha, 1));

    const linkMat = new THREE.ShaderMaterial({
      uniforms: {
        uCool: uniforms.uCool,
        uSignal: uniforms.uSignal,
        uWarmth: uniforms.uWarmth,
        uNear: uniforms.uNear,
        uFar: uniforms.uFar,
        uResolution: uniforms.uResolution,
        uClear: uniforms.uClear,
        uAmb: uniforms.uAmb,
        uOpacity: { value: 0.5 }
      },
      vertexShader: /* glsl */ `
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
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        uniform vec3 uCool;
        uniform vec3 uSignal;
        uniform float uWarmth;
        uniform float uOpacity;
        ${CLEAR}
        void main() {
          gl_FragColor = vec4(mix(uCool, uSignal, uWarmth * 0.55), vA * uOpacity * centreClear() * uAmb);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const links = new THREE.LineSegments(linkGeo, linkMat);

    /* ── the traffic ──────────────────────────────────────────── */
    /* Packets running the corridor faster than the camera. This is the
       single detail that separates a model of a network from a network
       that is carrying something, and it is 90 vec3 writes a frame. */
    const pkPos = new Float32Array(PACKETS * 3);
    const pkScale = new Float32Array(PACKETS);
    const pkSeed = new Float32Array(PACKETS);
    const pkWarm = new Float32Array(PACKETS);
    const pkT = new Float32Array(PACKETS);
    const pkSpeed = new Float32Array(PACKETS);
    const pkAngle = new Float32Array(PACKETS);
    const pkRadius = new Float32Array(PACKETS);

    for (let i = 0; i < PACKETS; i++) {
      pkT[i] = Math.random();
      pkSpeed[i] = 0.012 + Math.random() * 0.03;
      pkAngle[i] = Math.random() * Math.PI * 2;
      pkRadius[i] = 5 + Math.random() * 13;
      pkScale[i] = 1.5 + Math.random() * 1.5;
      pkSeed[i] = Math.random();
      pkWarm[i] = 0.35 + Math.random() * 0.65;
    }

    const pkGeo = new THREE.BufferGeometry();
    const pkAttr = new THREE.BufferAttribute(pkPos, 3);
    pkAttr.setUsage(THREE.DynamicDrawUsage);
    pkGeo.setAttribute('position', pkAttr);
    pkGeo.setAttribute('aScale', new THREE.BufferAttribute(pkScale, 1));
    pkGeo.setAttribute('aSeed', new THREE.BufferAttribute(pkSeed, 1));
    pkGeo.setAttribute('aWarm', new THREE.BufferAttribute(pkWarm, 1));

    const pkMat = new THREE.ShaderMaterial({
      uniforms: { ...uniforms, uSize: { value: 0.17 }, uClear: { value: 1 }, uAmb: uniforms.uAmb },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const packets = new THREE.Points(pkGeo, pkMat);

    const world = new THREE.Group();
    world.add(nodes, links, packets);
    scene.add(world);

    /* ── the frame ────────────────────────────────────────────── */
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // In device pixels: the clear is computed against `gl_FragCoord`,
      // which is not in CSS pixels.
      const p = renderer.getPixelRatio();
      uniforms.uResolution.value.set(w * p, h * p);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* ── the flight ───────────────────────────────────────────── */
    const clock = new THREE.Clock();
    let raf = 0;
    let flown = 0; // eased scroll, so a flick does not snap the camera
    let warmth = 0;

    /* The corridor runs warm through one chapter only. `fault` is the
       second station, and the three faults are the one moment on this
       page that is genuinely an alert — so that is the one place the
       field is allowed to change temperature. */
    const FAULT = 1 / (STATIONS - 1);

    /* The capability chapter draws the system explicitly — six nodes,
       named, wired, interactive. Running the ambient lattice at full
       strength behind it puts one network on top of another, and the
       eye cannot tell which one it is meant to read. So the corridor
       stands down while that chapter holds the screen. It is the same
       instinct as ducking a music bed under dialogue. */
    const CAPS = 2 / (STATIONS - 1);
    let amb = 1;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;

      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      pkMat.uniforms.uTime.value = t;

      // Eased, so scrolling drives the camera rather than yanking it.
      flown += (SIGNAL.scroll - flown) * 0.075;

      camera.position.z = 6 - flown * LENGTH * 0.9;

      /* The pointer leans the camera off the axis and the corridor
         parallaxes against it. Small on purpose: this sits behind
         reading matter, and a background that swings is a background
         you are fighting. */
      camera.position.x = SIGNAL.pxc * 2.6;
      camera.position.y = -SIGNAL.pyc * 1.9 + Math.sin(t * 0.16) * 0.8;

      /* Aim first, bank second — `lookAt` writes the whole rotation, so
         a roll set before it is simply discarded. Reading speed is the
         only thing that banks the camera, and it is what makes fast
         scrolling feel like travel rather than like a jump cut. */
      camera.lookAt(camera.position.x * 0.35, camera.position.y * 0.35, camera.position.z - 26);
      camera.rotation.z += SIGNAL.vel * 0.05 + Math.sin(t * 0.11) * 0.012;

      // Temperature: a band around the fault station, eased.
      const near = 1 - Math.min(1, Math.abs(flown - FAULT) / (FAULT * 0.85));
      warmth += (near * near - warmth) * 0.05;
      uniforms.uWarmth.value = warmth;
      pkMat.uniforms.uWarmth.value = warmth;
      linkMat.uniforms.uWarmth.value = warmth;

      /* Arrival. The last chapter is called Transmission, so at the end
         of the corridor the traffic stops running past you and starts
         running *somewhere*: the packets are drawn onto the axis and
         driven faster, and the whole field converges to the point the
         camera is pointed at. It is the same particles the page has
         been carrying since the hero, finally going somewhere — which
         is the only ending this story had available to it. */
      const arrival = Math.max(0, (flown - 0.84) / 0.16);
      const draw = arrival * arrival;

      const atCaps = 1 - Math.min(1, Math.abs(flown - CAPS) / (CAPS * 0.55));
      amb += (1 - 0.62 * atCaps * atCaps - amb) * 0.05;
      uniforms.uAmb.value = amb;

      // Traffic.
      for (let i = 0; i < PACKETS; i++) {
        pkT[i] += pkSpeed[i] * (0.016 + draw * 0.05);
        if (pkT[i] > 1) pkT[i] -= 1;
        const tp = pkT[i];
        const g = gauge(tp);
        const a = pkAngle[i] + t * 0.05;
        const r = pkRadius[i] * g * (1 - draw * 0.82);
        pkPos[i * 3] = Math.cos(a) * r;
        pkPos[i * 3 + 1] = Math.sin(a) * r * 0.72;
        pkPos[i * 3 + 2] = -tp * LENGTH;
      }
      pkAttr.needsUpdate = true;
      pkMat.uniforms.uSize.value = 0.17 + draw * 0.14;

      /* The centre opens for the traffic only. The lattice keeps its
         hole, so the largest type on the page never gets a field behind
         it — what fills the middle at the close is the packets, and
         nothing else. */
      pkMat.uniforms.uClear.value = 1 - draw * 0.92;
      linkMat.uniforms.uOpacity.value = 0.5 + draw * 0.18;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      nodeGeo.dispose();
      linkGeo.dispose();
      pkGeo.dispose();
      nodeMat.dispose();
      linkMat.dispose();
      pkMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [lite]);

  return <div ref={holder} className="system-scene" aria-hidden="true" />;
}
