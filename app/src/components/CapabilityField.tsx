import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CAPABILITIES } from '../content';

/* ═══════════════════════════════════════════════════════════════
   The capability field — the map, in three dimensions.

   The diagram used to be flat SVG with HTML discs on top of it. It read
   as a picture of a system. This is the system: seven bodies in real
   space, wired by curves that bow through the volume rather than
   crossing it, with charge running along the live ones and a haze of
   motes filling the depth between them. The camera answers the pointer
   and turns as the section passes, so the structure is seen from a
   slightly different angle every time.

   The controls stay in HTML. This scene projects each node's world
   position to the screen every frame and writes it straight onto the
   button's transform — no React render, no state, no second source of
   truth — so the hit areas, focus rings and accessible names remain the
   platform's while the thing you actually look at is WebGL.

   Nothing here is decorative-random: the seven bodies are his six
   capability areas around the core, and the curves are the relationships
   `CAPABILITIES[].links` records.
   ═══════════════════════════════════════════════════════════════ */

const N = CAPABILITIES.length;
const RING = 2.05;

/* Node positions. The ring is tilted out of the XY plane and each body
   is pushed a little along Z by its own index, so the structure has
   real depth to rotate through instead of being a disc seen at an
   angle. */
const NODE_POS = CAPABILITIES.map((_, i) => {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return new THREE.Vector3(Math.cos(a) * RING, Math.sin(a) * RING * 0.86, Math.sin(a * 2) * 0.42);
});
const CORE_POS = new THREE.Vector3(0, 0, 0);

type Link = { a: number; b: number; curve: THREE.QuadraticBezierCurve3 };

/* Core → node, then node → node for every relationship. The control
   point is pushed off the chord so a wire bows through the volume
   instead of lying flat across it. */
const LINKS: Link[] = (() => {
  const out: Link[] = [];
  const bow = (p: THREE.Vector3, q: THREE.Vector3, amount: number) => {
    const mid = p.clone().add(q).multiplyScalar(0.5);
    mid.z += amount;
    mid.multiplyScalar(1 + amount * 0.12);
    return new THREE.QuadraticBezierCurve3(p.clone(), mid, q.clone());
  };

  NODE_POS.forEach((p, i) => out.push({ a: -1, b: i, curve: bow(CORE_POS, p, 0.34) }));

  CAPABILITIES.forEach((cap, i) => {
    (cap.links as readonly number[]).forEach((j) => {
      if (j <= i) return;
      out.push({ a: i, b: j, curve: bow(NODE_POS[i], NODE_POS[j], -0.5) });
    });
  });

  return out;
})();

const SEGMENTS = 26;
const PULSES_PER_LINK = 2;

const QUALITY = {
  full: { motes: 420, dpr: 1.75, aa: true },
  lite: { motes: 150, dpr: 1.25, aa: false }
} as const;

const MOTE_VERT = /* glsl */ `
  attribute float aScale;
  attribute float aSeed;
  varying float vAlpha;
  uniform float uTime;
  uniform float uSize;

  void main() {
    vec3 p = position;
    // Each mote drifts on its own phase — a field that breathes rather
    // than a starfield that sits still.
    p.x += sin(uTime * 0.22 + aSeed * 6.283) * 0.16;
    p.y += cos(uTime * 0.19 + aSeed * 4.712) * 0.16;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vAlpha = aScale;
    gl_PointSize = uSize * aScale * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const MOTE_FRAG = /* glsl */ `
  varying float vAlpha;
  uniform float uAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    gl_FragColor = vec4(0.36, 0.88, 0.9, smoothstep(0.5, 0.0, d) * vAlpha * uAlpha);
  }
`;

export interface CapabilityFieldProps {
  /** Index of the node currently chosen. */
  active: number;
  /** Whether node `i` is the active one or wired to it. */
  isLit: (i: number) => boolean;
  /** The HTML controls this scene positions. Index 0…N-1 are the nodes;
      `core` is the centre label. */
  nodeEls: React.RefObject<(HTMLElement | null)[]>;
  coreEl: React.RefObject<HTMLElement | null>;
  lite?: boolean;
}

export default function CapabilityField({ active, isLit, nodeEls, coreEl, lite = false }: CapabilityFieldProps) {
  const holder = useRef<HTMLDivElement>(null);

  /* The scene reads these every frame instead of being torn down and
     rebuilt when the selection changes — a WebGL context rebuild on
     every hover would be absurd. */
  const state = useRef({ active, isLit });
  state.current = { active, isLit };

  useEffect(() => {
    const mount = holder.current;
    if (!mount) return;

    const { motes: MOTES, dpr, aa } = QUALITY[lite ? 'lite' : 'full'];

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: aa, alpha: true, powerPreference: 'low-power' });
    } catch {
      return; // No WebGL — the CSS fallback behind this stays visible.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

    const group = new THREE.Group();
    scene.add(group);

    const CYAN = new THREE.Color('#5ce1e6');
    const DIM = new THREE.Color('#2a3138');

    /* ── the wires ────────────────────────────────────────────── */
    /* One geometry for every link, coloured per vertex so a link can be
       lit or dimmed by rewriting its colour range rather than by
       swapping materials. */
    const linkPos: number[] = [];
    LINKS.forEach((l) => {
      const pts = l.curve.getPoints(SEGMENTS);
      for (let s = 0; s < SEGMENTS; s++) {
        linkPos.push(pts[s].x, pts[s].y, pts[s].z, pts[s + 1].x, pts[s + 1].y, pts[s + 1].z);
      }
    });

    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPos, 3));
    const linkCol = new Float32Array(linkPos.length);
    const linkColAttr = new THREE.BufferAttribute(linkCol, 3);
    linkColAttr.setUsage(THREE.DynamicDrawUsage);
    linkGeo.setAttribute('color', linkColAttr);

    const linkMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    group.add(new THREE.LineSegments(linkGeo, linkMat));

    // Vertices per link, so a link's colour range can be found by index.
    const VPL = SEGMENTS * 2;

    /* ── the bodies ───────────────────────────────────────────── */
    const nodeGeo = new THREE.SphereGeometry(0.085, 20, 20);
    const nodeMats: THREE.MeshBasicMaterial[] = [];
    const nodeMeshes: THREE.Mesh[] = [];
    const halos: THREE.Sprite[] = [];

    const haloTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 96;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(48, 48, 0, 48, 48, 48);
      grad.addColorStop(0, 'rgba(92,225,230,0.5)');
      grad.addColorStop(0.3, 'rgba(92,225,230,0.12)');
      grad.addColorStop(1, 'rgba(92,225,230,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 96, 96);
      return new THREE.CanvasTexture(c);
    })();

    NODE_POS.forEach((p) => {
      const mat = new THREE.MeshBasicMaterial({ color: CYAN.clone(), transparent: true });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.position.copy(p);
      group.add(mesh);
      nodeMats.push(mat);
      nodeMeshes.push(mesh);

      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      halo.position.copy(p);
      halo.scale.setScalar(0.42);
      group.add(halo);
      halos.push(halo);
    });

    // The core is a body too, so the wires meet something.
    const coreMat = new THREE.MeshBasicMaterial({ color: CYAN.clone(), transparent: true, opacity: 0.55 });
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), coreMat);
    group.add(coreMesh);

    /* ── the charge ───────────────────────────────────────────── */
    /* Points that run the curves. Only the live links carry any, so the
       motion means "this is connected to what you chose" rather than
       being ambient sparkle. */
    const pulseCount = LINKS.length * PULSES_PER_LINK;
    const pulsePos = new Float32Array(pulseCount * 3);
    const pulseAlpha = new Float32Array(pulseCount);
    const pulseT = new Float32Array(pulseCount);
    for (let i = 0; i < pulseCount; i++) pulseT[i] = Math.random();

    const pulseGeo = new THREE.BufferGeometry();
    const pulsePosAttr = new THREE.BufferAttribute(pulsePos, 3);
    const pulseAlphaAttr = new THREE.BufferAttribute(pulseAlpha, 1);
    pulsePosAttr.setUsage(THREE.DynamicDrawUsage);
    pulseAlphaAttr.setUsage(THREE.DynamicDrawUsage);
    pulseGeo.setAttribute('position', pulsePosAttr);
    pulseGeo.setAttribute('aScale', pulseAlphaAttr);
    pulseGeo.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(pulseCount), 1));

    const pulseMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 0.24 }, uAlpha: { value: 0.95 } },
      vertexShader: MOTE_VERT,
      fragmentShader: MOTE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Points(pulseGeo, pulseMat));

    /* ── the haze ─────────────────────────────────────────────── */
    const motePos = new Float32Array(MOTES * 3);
    const moteScale = new Float32Array(MOTES);
    const moteSeed = new Float32Array(MOTES);
    for (let i = 0; i < MOTES; i++) {
      // A shell around the structure, not a cube of noise.
      const r = 1.4 + Math.random() * 2.6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      motePos[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      motePos[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.8;
      motePos[i * 3 + 2] = Math.cos(ph) * r * 0.7;
      moteScale[i] = 0.35 + Math.random() * 0.9;
      moteSeed[i] = Math.random();
    }

    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    moteGeo.setAttribute('aScale', new THREE.BufferAttribute(moteScale, 1));
    moteGeo.setAttribute('aSeed', new THREE.BufferAttribute(moteSeed, 1));

    const moteUniforms = { uTime: { value: 0 }, uSize: { value: 0.075 }, uAlpha: { value: 0.3 } };
    const moteMat = new THREE.ShaderMaterial({
      uniforms: moteUniforms,
      vertexShader: MOTE_VERT,
      fragmentShader: MOTE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Points(moteGeo, moteMat));

    /* ── responses ────────────────────────────────────────────── */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (fine) window.addEventListener('pointermove', onPointer, { passive: true });

    /* How far through the section we are, 0…1. Drives the camera turn,
       so the structure is seen from a different angle on the way in than
       on the way out — and gives touch devices the camera move that the
       pointer gives everyone else. */
    let progress = 0.5;
    const onScroll = () => {
      const r = mount.getBoundingClientRect();
      const span = window.innerHeight + r.height;
      progress = Math.min(1, Math.max(0, (window.innerHeight - r.top) / span));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(mount);

    /* ── loop ─────────────────────────────────────────────────── */
    const clock = new THREE.Clock();
    const projected = new THREE.Vector3();
    const tmpColor = new THREE.Color();
    let raf = 0;

    const place = (el: HTMLElement | null, world: THREE.Vector3, w: number, h: number) => {
      if (!el) return;
      projected.copy(world).applyMatrix4(group.matrixWorld).project(camera);
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * h;
      // Depth as scale, so a body further back reads as further back.
      const s = 1 + (1 - projected.z) * 0.35;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      moteUniforms.uTime.value = t;
      pulseMat.uniforms.uTime.value = t;

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      // Camera: pointer leans it, scroll turns it, and a slow drift keeps
      // it from ever sitting perfectly still.
      group.rotation.y = pointer.x * 0.5 + (progress - 0.5) * 0.85 + Math.sin(t * 0.12) * 0.05;
      group.rotation.x = pointer.y * 0.32 + (progress - 0.5) * -0.3;
      group.updateMatrixWorld();

      const { active: act, isLit: lit } = state.current;

      // Bodies: the chosen one swells and burns, its neighbours glow,
      // the rest recede.
      NODE_POS.forEach((_, i) => {
        const on = i === act;
        const l = lit(i);
        const target = on ? 1.9 : l ? 1.25 : 0.85;
        const m = nodeMeshes[i];
        m.scale.setScalar(m.scale.x + (target - m.scale.x) * 0.12);
        nodeMats[i].color.lerp(l ? CYAN : DIM, 0.1);
        nodeMats[i].opacity += ((l ? 1 : 0.5) - nodeMats[i].opacity) * 0.1;

        const halo = halos[i];
        const haloTarget = on ? 1.05 + Math.sin(t * 2.1) * 0.09 : l ? 0.62 : 0.24;
        halo.scale.setScalar(halo.scale.x + (haloTarget - halo.scale.x) * 0.1);
      });

      coreMat.opacity = 0.45 + Math.sin(t * 1.4) * 0.12;
      coreMesh.scale.setScalar(1 + Math.sin(t * 1.4) * 0.05);

      // Wires: colour written per link, so lighting is one buffer update.
      LINKS.forEach((l, li) => {
        const live = l.a === -1 ? l.b === act : lit(l.a) && lit(l.b);
        tmpColor.copy(live ? CYAN : DIM).multiplyScalar(live ? 0.85 : 0.16);
        for (let v = 0; v < VPL; v++) {
          const o = (li * VPL + v) * 3;
          linkCol[o] += (tmpColor.r - linkCol[o]) * 0.12;
          linkCol[o + 1] += (tmpColor.g - linkCol[o + 1]) * 0.12;
          linkCol[o + 2] += (tmpColor.b - linkCol[o + 2]) * 0.12;
        }
      });
      linkColAttr.needsUpdate = true;

      // Charge: only along live wires.
      for (let i = 0; i < pulseCount; i++) {
        const li = Math.floor(i / PULSES_PER_LINK);
        const l = LINKS[li];
        const live = l.a === -1 ? l.b === act : lit(l.a) && lit(l.b);

        pulseT[i] += dt * (0.34 + (i % 3) * 0.09);
        if (pulseT[i] > 1) pulseT[i] -= 1;

        const target = live ? 1 : 0;
        pulseAlpha[i] += (target - pulseAlpha[i]) * 0.14;

        const p = l.curve.getPoint(pulseT[i]);
        pulsePos[i * 3] = p.x;
        pulsePos[i * 3 + 1] = p.y;
        pulsePos[i * 3 + 2] = p.z;
      }
      pulsePosAttr.needsUpdate = true;
      pulseAlphaAttr.needsUpdate = true;

      // The controls follow their bodies.
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      NODE_POS.forEach((p, i) => place(nodeEls.current?.[i] ?? null, p, w, h));
      place(coreEl.current, CORE_POS, w, h);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      io.disconnect();
      linkGeo.dispose();
      nodeGeo.dispose();
      pulseGeo.dispose();
      moteGeo.dispose();
      coreMesh.geometry.dispose();
      linkMat.dispose();
      pulseMat.dispose();
      moteMat.dispose();
      coreMat.dispose();
      nodeMats.forEach((m) => m.dispose());
      halos.forEach((s) => (s.material as THREE.SpriteMaterial).dispose());
      haloTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // The scene is built once. Selection reaches it through `state`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lite]);

  return <div ref={holder} className="absolute inset-0" aria-hidden="true" />;
}
