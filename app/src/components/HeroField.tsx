import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   The signal field.

   A shell of points distributed by the Fibonacci lattice and stitched
   to their nearest neighbours, so the surface reads as a network rather
   than a geodesic cage. The shell is hollow on purpose: this canvas is
   centred on the portrait aperture, so the person sits inside his own
   network instead of beside a decorative sphere.

   Spokes run from just outside the aperture out to the shell, dim at
   the inner end so they appear to emerge from behind the portrait, and
   a handful of pulses travel along them.

   It answers to the pointer (tilt + parallax) and to scroll (the shell
   disperses as the hero leaves). It idles when off-screen or when the
   tab is hidden, and disposes everything it allocated on unmount.
   ═══════════════════════════════════════════════════════════════ */

/* Phones run the same field at roughly half the nodes and a capped pixel
   ratio. The neighbour stitch is O(n²) at build time, so halving the count
   quarters that too, and the fill cost drops with the device ratio — which
   is what actually matters on a phone GPU. */
const NEIGHBOURS = 2;
const QUALITY = {
  full: { count: 700, dpr: 1.75, spokes: 22, aa: true },
  lite: { count: 300, dpr: 1.25, spokes: 12, aa: false }
} as const;

/* Where a spoke starts. The aperture covers roughly the inner third of
   this canvas, so anything closer than this is hidden behind the face
   and only costs fill. */
const INNER = 0.36;

const VERT = /* glsl */ `
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
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * vFade);
  }
`;

export default function HeroField({ lite = false }: { lite?: boolean }) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { count: COUNT, dpr, spokes: SPOKES, aa } = QUALITY[lite ? 'lite' : 'full'];
    const mount = holder.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: aa, alpha: true, powerPreference: 'low-power' });
    } catch {
      return; // No WebGL — the CSS fallback behind this stays visible.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

    /* ── the shell ────────────────────────────────────────────── */
    const positions = new Float32Array(COUNT * 3);
    const dirs = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    const pts: THREE.Vector3[] = [];

    const cyan = new THREE.Color('#5ce1e6');
    const blue = new THREE.Color('#4f7cff');
    const violet = new THREE.Color('#8b5cf6');
    const tmp = new THREE.Color();

    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const v = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
      pts.push(v);

      positions.set([v.x, v.y, v.z], i * 3);
      dirs.set([v.x, v.y, v.z], i * 3);

      // Hue rides the vertical axis: cyan at the pole, violet at the base.
      const t = (y + 1) / 2;
      tmp.copy(t > 0.5 ? cyan.clone().lerp(blue, (1 - t) * 2) : blue.clone().lerp(violet, 1 - t * 2));
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);

      scales[i] = Math.random() < 0.06 ? 2.6 + Math.random() * 1.6 : 0.5 + Math.random() * 0.6;
      seeds[i] = Math.random();
    }

    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointGeo.setAttribute('aDir', new THREE.BufferAttribute(dirs, 3));
    pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pointGeo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    pointGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    /* uSize is a world-space radius, not pixels: the shader converts it
       with (320 / -z), which at this camera distance is roughly ×76.
       Feeding pixels in here produced 200px sprites that additively
       blew the whole shell out to a solid white disc. */
    const uniforms = {
      uSize: { value: 0.055 },
      uDisperse: { value: 0 },
      uTime: { value: 0 }
    };

    const pointMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const points = new THREE.Points(pointGeo, pointMat);

    /* Stitch each point to its nearest neighbours. O(n²) once at build
       time on 700 points is a few milliseconds and never runs again. */
    const linePos: number[] = [];
    const lineCol: number[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < COUNT; i++) {
      const best: { j: number; d: number }[] = [];
      for (let j = 0; j < COUNT; j++) {
        if (i === j) continue;
        const d = pts[i].distanceToSquared(pts[j]);
        if (best.length < NEIGHBOURS) best.push({ j, d });
        else {
          let worst = 0;
          for (let k = 1; k < best.length; k++) if (best[k].d > best[worst].d) worst = k;
          if (d < best[worst].d) best[worst] = { j, d };
        }
      }
      for (const { j } of best) {
        const key = i < j ? `${i}:${j}` : `${j}:${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        linePos.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        for (const idx of [i, j]) {
          lineCol.push(colors[idx * 3], colors[idx * 3 + 1], colors[idx * 3 + 2]);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const lines = new THREE.LineSegments(lineGeo, lineMat);

    /* ── the spokes ───────────────────────────────────────────── */
    /* Radial wires from just outside the aperture to the shell. Blending
       is additive, so brightness *is* colour magnitude: scaling the inner
       vertex toward black is the fade, and costs nothing to draw. */
    const spokeIdx: number[] = [];
    const spokePos: number[] = [];
    const spokeCol: number[] = [];
    const step = Math.floor(COUNT / SPOKES);

    for (let s = 0; s < SPOKES; s++) {
      const i = (s * step + ((s * 37) % step)) % COUNT;
      spokeIdx.push(i);
      const d = pts[i];
      spokePos.push(d.x * INNER, d.y * INNER, d.z * INNER, d.x, d.y, d.z);
      const [r, g, b] = [colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]];
      spokeCol.push(r * 0.04, g * 0.04, b * 0.04, r, g, b);
    }

    const spokeGeo = new THREE.BufferGeometry();
    spokeGeo.setAttribute('position', new THREE.Float32BufferAttribute(spokePos, 3));
    spokeGeo.setAttribute('color', new THREE.Float32BufferAttribute(spokeCol, 3));

    const spokeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const spokeLines = new THREE.LineSegments(spokeGeo, spokeMat);

    /* ── the pulses ───────────────────────────────────────────── */
    /* One travelling point per spoke, its position rewritten each frame.
       At most 22 vec3 writes — far cheaper than any particle system, and
       it is the detail that makes the field read as *carrying* something
       rather than merely existing. */
    const pulseN = spokeIdx.length;
    const pulsePos = new Float32Array(pulseN * 3);
    const pulseDir = new Float32Array(pulseN * 3);
    const pulseCol = new Float32Array(pulseN * 3);
    const pulseScale = new Float32Array(pulseN);
    const pulseSeed = new Float32Array(pulseN);
    const pulseT = new Float32Array(pulseN);

    for (let s = 0; s < pulseN; s++) {
      const i = spokeIdx[s];
      pulseDir.set([pts[i].x, pts[i].y, pts[i].z], s * 3);
      pulseCol.set([colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]], s * 3);
      pulseScale[s] = 1.5 + Math.random() * 0.9;
      pulseSeed[s] = Math.random();
      pulseT[s] = Math.random();
    }

    const pulseGeo = new THREE.BufferGeometry();
    const pulseAttr = new THREE.BufferAttribute(pulsePos, 3);
    pulseAttr.setUsage(THREE.DynamicDrawUsage);
    pulseGeo.setAttribute('position', pulseAttr);
    pulseGeo.setAttribute('aDir', new THREE.BufferAttribute(pulseDir, 3));
    pulseGeo.setAttribute('color', new THREE.BufferAttribute(pulseCol, 3));
    pulseGeo.setAttribute('aScale', new THREE.BufferAttribute(pulseScale, 1));
    pulseGeo.setAttribute('aSeed', new THREE.BufferAttribute(pulseSeed, 1));

    const pulseMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const pulses = new THREE.Points(pulseGeo, pulseMat);

    const group = new THREE.Group();
    group.add(points, lines, spokeLines, pulses);
    group.rotation.z = -0.18;
    scene.add(group);

    /* ── responses ────────────────────────────────────────────── */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // Scroll drives dispersal directly — no GSAP needed for one value.
    let scrollT = 0;
    const onScroll = () => {
      const h = window.innerHeight;
      scrollT = Math.min(1, Math.max(0, window.scrollY / h));
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
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      uniforms.uDisperse.value += (scrollT * 1.5 - uniforms.uDisperse.value) * 0.06;

      // Pulses run outward, then restart from the aperture.
      for (let s = 0; s < pulseN; s++) {
        pulseT[s] += dt * (0.16 + pulseSeed[s] * 0.2);
        if (pulseT[s] > 1) pulseT[s] -= 1;
        const r = INNER + (1 - INNER) * pulseT[s];
        pulsePos[s * 3] = pulseDir[s * 3] * r;
        pulsePos[s * 3 + 1] = pulseDir[s * 3 + 1] * r;
        pulsePos[s * 3 + 2] = pulseDir[s * 3 + 2] * r;
      }
      pulseAttr.needsUpdate = true;

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      group.rotation.y = t * 0.055 + pointer.x * 0.42;
      group.rotation.x = pointer.y * 0.3;
      group.position.y = -scrollT * 0.55;

      const fade = 1 - scrollT * 0.85;
      lineMat.opacity = 0.13 * fade;
      spokeMat.opacity = 0.5 * fade;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      io.disconnect();
      pointGeo.dispose();
      lineGeo.dispose();
      spokeGeo.dispose();
      pulseGeo.dispose();
      pointMat.dispose();
      lineMat.dispose();
      spokeMat.dispose();
      pulseMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [lite]);

  return <div ref={holder} className="absolute inset-0" aria-hidden="true" />;
}
