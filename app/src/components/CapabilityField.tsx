import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CAPABILITIES } from '../content';

/* ═══════════════════════════════════════════════════════════════
   THE COMMAND CORE — the capability map as an instrument.

   It used to be six spheres on a ring around a seventh, slightly larger
   sphere. That is a node diagram, and a node diagram is a picture of a
   system rather than a piece of one. This is built as equipment:

     the core      a reticle — concentric rings on three axes, a
                   graduated dial, four registration brackets, each
                   turning at its own rate. It surrounds the readout
                   rather than sitting behind it.
     the bus       the rim of the core, at CORE_R. Wires leave from
                   there, not from the origin, so the centre stays
                   clear for the name it is holding.
     the modules   hexagonal plates, not spheres. Six sides reads as
                   machined; a circle reads as a bullet point.
     the traces    core-to-module runs solid and carries charge;
                   module-to-module runs dashed and dim. Two weights,
                   so the eye is told which relationship is primary.

   Light is rationed. The rings, ticks, brackets and plates are drawn
   with normal blending so they stay *lines* — precise, matte, and
   readable at rest. Only what is genuinely energy (charge, halo, haze)
   blends additively. That distinction is the whole difference between
   an instrument and a neon sign.

   The controls stay in HTML: this scene projects each node's world
   position to the screen every frame and writes it onto the button's
   transform, so hit areas, focus rings and accessible names remain the
   platform's. `place` is bounded at the point it writes — see below.

   Nothing here is decorative-random: the seven bodies are his six real
   capability areas around the core, and the traces are the
   relationships `CAPABILITIES[].links` records.
   ═══════════════════════════════════════════════════════════════ */

const N = CAPABILITIES.length;
const RING = 2.05;

/* The radius the core assembly occupies, and therefore the rim the
   traces leave from. Sized to clear the HTML readout that sits over the
   middle — a wire emerging from behind a name looks like a mistake. */
const CORE_R = 1.02;

/* Node positions. The ring is tilted out of the XY plane and each body
   is pushed along Z by its own index, so the structure has real depth to
   rotate through instead of being a disc seen at an angle. The z spread
   is deliberately uneven: modules on one plane read as a diagram. */
const NODE_POS = CAPABILITIES.map((_, i) => {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return new THREE.Vector3(
    Math.cos(a) * RING,
    Math.sin(a) * RING * 0.86,
    Math.sin(a * 2) * 0.42 + Math.cos(a * 3) * 0.22
  );
});
const CORE_POS = new THREE.Vector3(0, 0, 0);

type Link = { a: number; b: number; curve: THREE.QuadraticBezierCurve3; dashed: boolean };

/* Core → node from the bus rim, then node → node for every recorded
   relationship. The control point is pushed off the chord so a wire bows
   through the volume instead of lying flat across it. */
const LINKS: Link[] = (() => {
  const out: Link[] = [];
  const bow = (p: THREE.Vector3, q: THREE.Vector3, amount: number) => {
    const mid = p.clone().add(q).multiplyScalar(0.5);
    mid.z += amount;
    mid.multiplyScalar(1 + amount * 0.12);
    return new THREE.QuadraticBezierCurve3(p.clone(), mid, q.clone());
  };

  NODE_POS.forEach((p, i) => {
    // Leaves the rim on the bearing of the module it serves.
    const rim = p.clone().setZ(0).normalize().multiplyScalar(CORE_R);
    rim.z = p.z * 0.25;
    out.push({ a: -1, b: i, curve: bow(rim, p, 0.28), dashed: false });
  });

  CAPABILITIES.forEach((cap, i) => {
    (cap.links as readonly number[]).forEach((j) => {
      if (j <= i) return;
      out.push({ a: i, b: j, curve: bow(NODE_POS[i], NODE_POS[j], -0.5), dashed: true });
    });
  });

  return out;
})();

const SEGMENTS = 30;
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

/* ── drawing primitives ───────────────────────────────────────────
   The core is built from these rather than from meshes, because every
   part of it is a line: that is what makes it read as drawn equipment
   instead of modelled objects. */

const ring = (r: number, segs = 128) => {
  const p: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    p.push(Math.cos(a) * r, Math.sin(a) * r, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  return g;
};

const arc = (r: number, from: number, to: number, segs = 20) => {
  const p: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = from + (to - from) * (i / segs);
    p.push(Math.cos(a) * r, Math.sin(a) * r, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  return g;
};

/* A graduated dial. Every sixth mark runs long, which is the detail that
   makes a ring of ticks read as a scale rather than as a texture. */
const graduations = (rIn: number, rOut: number, rLong: number, count: number) => {
  const p: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const out = i % 6 === 0 ? rLong : rOut;
    p.push(Math.cos(a) * rIn, Math.sin(a) * rIn, 0, Math.cos(a) * out, Math.sin(a) * out, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  return g;
};

const hexagon = (r: number) => {
  const p: number[] = [];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    p.push(Math.cos(a) * r, Math.sin(a) * r, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  return g;
};

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

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

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
    /* `renderer.render` refreshes this, but the controls are projected
       through the camera BEFORE the first render — with an identity
       matrix the perspective divide runs against a positive view-space
       z, the sign flips, and a node lands thousands of pixels off the
       page. Build the matrix up front so frame one is already sane. */
    camera.updateMatrixWorld();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

    const group = new THREE.Group();
    scene.add(group);

    const CYAN = new THREE.Color('#5ce1e6');
    /* The resting colour of an unlit module. Selection should reduce the
       others, not delete them: at #2a3138 four of the six areas vanished
       and the map stopped describing a system. Steel reads as present
       and unselected; soot reads as absent. */
    const DIM = new THREE.Color('#55636f');
    const dispose: { dispose(): void }[] = [];

    /* Every line in the core and the modules is matte. Additive would
       bloom them into each other and the precision — which is the whole
       point of the object — would be the first thing lost. */
    const lineMat = (color: THREE.Color | string, opacity: number) => {
      const m = new THREE.LineBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity });
      dispose.push(m);
      return m;
    };

    const keep = <T extends THREE.BufferGeometry>(g: T) => {
      dispose.push(g);
      return g;
    };

    /* ── the core assembly ────────────────────────────────────── */
    /* Three rings on three axes, a dial, and four registration
       brackets. Each turns at its own rate and in its own direction, so
       the thing reads as mechanism rather than as one spinning object.
       All of it is slow: at rest this has to look composed, not busy. */
    const core = new THREE.Group();
    group.add(core);

    const ringA = new THREE.Line(keep(ring(0.78)), lineMat('#5ce1e6', 0.22));
    ringA.rotation.set(0.52, 0.18, 0);

    const ringB = new THREE.Line(keep(ring(CORE_R)), lineMat('#5ce1e6', 0.34));
    ringB.rotation.set(-0.28, 0.46, 0);

    const ringC = new THREE.Line(keep(ring(1.24)), lineMat('#8fa0ad', 0.16));

    const dial = new THREE.LineSegments(keep(graduations(1.06, 1.11, 1.17, 48)), lineMat('#5ce1e6', 0.3));

    const brackets = new THREE.Group();
    const bracketMat = lineMat('#8fa0ad', 0.3);
    for (let i = 0; i < 4; i++) {
      const c = Math.PI / 4 + (i / 4) * Math.PI * 2;
      brackets.add(new THREE.Line(keep(arc(1.34, c - 0.22, c + 0.22)), bracketMat));
    }

    core.add(ringA, ringB, ringC, dial, brackets);

    /* Three indicators riding the bus rim. They are the only part of the
       core that moves quickly enough to catch the eye, and there are
       three of them because two reads as a pair and four as a pattern. */
    const orbGeo = keep(new THREE.SphereGeometry(0.028, 10, 10));
    const orbMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.85 });
    dispose.push(orbMat);
    const orbiters = [0, 1, 2].map((i) => {
      const m = new THREE.Mesh(orbGeo, orbMat);
      m.userData.phase = (i / 3) * Math.PI * 2;
      ringB.add(m);
      return m;
    });

    /* ── the traces ───────────────────────────────────────────── */
    /* One geometry for every link, coloured per vertex so a link can be
       lit or dimmed by rewriting its colour range rather than by
       swapping materials. Dashed links emit alternate segments only, so
       a secondary relationship reads as a broken trace — and each link
       records where its vertices start, since the two kinds no longer
       contribute the same count. */
    const linkPos: number[] = [];
    const linkRange: { at: number; count: number }[] = [];

    LINKS.forEach((l) => {
      const pts = l.curve.getPoints(SEGMENTS);
      const at = linkPos.length / 3;
      let count = 0;
      for (let s = 0; s < SEGMENTS; s++) {
        if (l.dashed && s % 2 === 1) continue;
        linkPos.push(pts[s].x, pts[s].y, pts[s].z, pts[s + 1].x, pts[s + 1].y, pts[s + 1].z);
        count += 2;
      }
      linkRange.push({ at, count });
    });

    const linkGeo = keep(new THREE.BufferGeometry());
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPos, 3));
    const linkCol = new Float32Array(linkPos.length);
    const linkColAttr = new THREE.BufferAttribute(linkCol, 3);
    linkColAttr.setUsage(THREE.DynamicDrawUsage);
    linkGeo.setAttribute('color', linkColAttr);

    const linkMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    dispose.push(linkMat);
    group.add(new THREE.LineSegments(linkGeo, linkMat));

    /* ── the modules ──────────────────────────────────────────── */
    /* A hexagonal plate, a filled centre and two flanking marks. Each
       plate carries a small tilt of its own so the six do not read as
       one stamped row seen in perspective. */
    const hexOuter = keep(hexagon(0.21));
    const hexInner = keep(new THREE.CircleGeometry(0.062, 6));
    const markGeo = keep(
      (() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute(
          'position',
          new THREE.Float32BufferAttribute([-0.3, 0, 0, -0.25, 0, 0, 0.25, 0, 0, 0.3, 0, 0], 3)
        );
        return g;
      })()
    );

    type Module = {
      hub: THREE.Group;
      plate: THREE.Line;
      plateMat: THREE.LineBasicMaterial;
      fill: THREE.Mesh;
      fillMat: THREE.MeshBasicMaterial;
      marks: THREE.LineSegments;
      markMat: THREE.LineBasicMaterial;
      halo: THREE.Sprite;
    };

    const haloTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 96;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(48, 48, 0, 48, 48, 48);
      grad.addColorStop(0, 'rgba(92,225,230,0.42)');
      grad.addColorStop(0.3, 'rgba(92,225,230,0.1)');
      grad.addColorStop(1, 'rgba(92,225,230,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 96, 96);
      return new THREE.CanvasTexture(c);
    })();

    const modules: Module[] = NODE_POS.map((p, i) => {
      const hub = new THREE.Group();
      hub.position.copy(p);
      hub.rotation.set(Math.sin(i * 1.7) * 0.3, Math.cos(i * 2.1) * 0.35, i * 0.22);

      const plateMat = lineMat(DIM, 0.9);
      const plate = new THREE.Line(hexOuter, plateMat);

      const fillMat = new THREE.MeshBasicMaterial({ color: DIM.clone(), transparent: true, opacity: 0.6 });
      dispose.push(fillMat);
      const fill = new THREE.Mesh(hexInner, fillMat);

      const markMat = lineMat(DIM, 0.7);
      const marks = new THREE.LineSegments(markGeo, markMat);

      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      halo.scale.setScalar(0.42);

      hub.add(plate, fill, marks, halo);
      group.add(hub);
      return { hub, plate, plateMat, fill, fillMat, marks, markMat, halo };
    });

    /* ── the charge ───────────────────────────────────────────── */
    /* Points that run the curves. Only the live links carry any, so the
       motion means "this is connected to what you chose" rather than
       being ambient sparkle. */
    const pulseCount = LINKS.length * PULSES_PER_LINK;
    const pulsePos = new Float32Array(pulseCount * 3);
    const pulseAlpha = new Float32Array(pulseCount);
    const pulseT = new Float32Array(pulseCount);
    for (let i = 0; i < pulseCount; i++) pulseT[i] = Math.random();

    const pulseGeo = keep(new THREE.BufferGeometry());
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
    dispose.push(pulseMat);
    group.add(new THREE.Points(pulseGeo, pulseMat));

    /* ── the haze ─────────────────────────────────────────────── */
    /* The furthest layer. Dim enough to be atmosphere rather than
       content — it exists so the structure has something to be in
       front of. */
    const motePos = new Float32Array(MOTES * 3);
    const moteScale = new Float32Array(MOTES);
    const moteSeed = new Float32Array(MOTES);
    for (let i = 0; i < MOTES; i++) {
      // A shell around the structure, not a cube of noise.
      const r = 1.9 + Math.random() * 2.8;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      motePos[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      motePos[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.8;
      motePos[i * 3 + 2] = Math.cos(ph) * r * 0.7 - 0.6;
      moteScale[i] = 0.3 + Math.random() * 0.8;
      moteSeed[i] = Math.random();
    }

    const moteGeo = keep(new THREE.BufferGeometry());
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    moteGeo.setAttribute('aScale', new THREE.BufferAttribute(moteScale, 1));
    moteGeo.setAttribute('aSeed', new THREE.BufferAttribute(moteSeed, 1));

    const moteUniforms = { uTime: { value: 0 }, uSize: { value: 0.075 }, uAlpha: { value: 0.24 } };
    const moteMat = new THREE.ShaderMaterial({
      uniforms: moteUniforms,
      vertexShader: MOTE_VERT,
      fragmentShader: MOTE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    dispose.push(moteMat);
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

    /* A projection is only meaningful for a point in front of the
       camera. Behind it, the perspective divide is by a negative w and
       the result runs off to ±infinity — which, written into a
       `translate3d`, is a real button parked thousands of pixels outside
       the document. So the view-space depth is checked before the
       divide, and the result is held inside the stage regardless. This
       is what keeps the scene from being able to widen the page: the
       numbers it writes are bounded at the point they are written, not
       clipped after the fact. */
    const view = new THREE.Vector3();

    const place = (el: HTMLElement | null, world: THREE.Vector3, w: number, h: number) => {
      if (!el || !w || !h) return;

      view.copy(world).applyMatrix4(group.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      // In view space the camera looks down -z, so anything at or behind
      // the near plane has no honest screen position. Leave the last one.
      if (!Number.isFinite(view.z) || view.z > -camera.near) return;

      projected.copy(view).applyMatrix4(camera.projectionMatrix);
      if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y)) return;

      const x = clamp((projected.x * 0.5 + 0.5) * w, 0, w);
      const y = clamp((-projected.y * 0.5 + 0.5) * h, 0, h);
      // Depth as scale, so a body further back reads as further back.
      const s = clamp(1 + (1 - projected.z) * 0.35, 0.55, 1.5);
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

      /* The mechanism. Four rates, two directions — slow enough that a
         still screenshot of this looks composed. */
      ringA.rotation.z = t * 0.055;
      ringB.rotation.z = -t * 0.038;
      ringC.rotation.z = t * 0.019;
      dial.rotation.z = -t * 0.013;
      brackets.rotation.z = t * 0.007;

      orbiters.forEach((m, i) => {
        const a = m.userData.phase + t * 0.42 * (i % 2 ? -1 : 1);
        m.position.set(Math.cos(a) * CORE_R, Math.sin(a) * CORE_R, 0);
      });

      // The core answers a selection: the bus ring brightens with it.
      const busTarget = act >= 0 ? 0.5 : 0.34;
      (ringB.material as THREE.LineBasicMaterial).opacity +=
        (busTarget - (ringB.material as THREE.LineBasicMaterial).opacity) * 0.06;
      (dial.material as THREE.LineBasicMaterial).opacity = 0.26 + Math.sin(t * 1.1) * 0.05;

      /* Modules: the chosen one squares up and burns, its neighbours
         hold, the rest recede. Scale is on the plate rather than on a
         sphere, so what grows is a drawn edge. */
      modules.forEach((m, i) => {
        const on = i === act;
        const l = lit(i);
        const target = on ? 1.34 : l ? 1.1 : 0.9;
        m.hub.scale.setScalar(m.hub.scale.x + (target - m.hub.scale.x) * 0.12);
        // A selected module turns to face front; the others keep their lean.
        m.hub.rotation.z += ((on ? 0 : i * 0.22) - m.hub.rotation.z) * 0.08;

        m.plateMat.color.lerp(l ? CYAN : DIM, 0.1);
        m.plateMat.opacity += ((on ? 1 : l ? 0.8 : 0.62) - m.plateMat.opacity) * 0.1;
        m.fillMat.color.lerp(on ? CYAN : DIM, 0.1);
        m.fillMat.opacity += ((on ? 0.95 : l ? 0.55 : 0.4) - m.fillMat.opacity) * 0.1;
        m.markMat.color.lerp(l ? CYAN : DIM, 0.1);
        m.markMat.opacity += ((l ? 0.65 : 0.4) - m.markMat.opacity) * 0.1;

        const haloTarget = on ? 1.0 + Math.sin(t * 2.1) * 0.08 : l ? 0.55 : 0.2;
        m.halo.scale.setScalar(m.halo.scale.x + (haloTarget - m.halo.scale.x) * 0.1);
      });

      // Traces: colour written per link, so lighting is one buffer update.
      LINKS.forEach((l, li) => {
        const live = l.a === -1 ? l.b === act : lit(l.a) && lit(l.b);
        const weight = live ? 0.9 : l.dashed ? 0.22 : 0.36;
        tmpColor.copy(live ? CYAN : DIM).multiplyScalar(weight);
        const { at, count } = linkRange[li];
        for (let v = 0; v < count; v++) {
          const o = (at + v) * 3;
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
      dispose.forEach((d) => d.dispose());
      modules.forEach((m) => (m.halo.material as THREE.SpriteMaterial).dispose());
      haloTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // The scene is built once. Selection reaches it through `state`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lite]);

  return <div ref={holder} className="absolute inset-0" aria-hidden="true" />;
}
