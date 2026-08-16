import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   The signal field.

   A sphere of points distributed by the Fibonacci lattice, stitched to
   their nearest neighbours so the surface reads as a network rather
   than a geodesic cage. A handful of nodes carry a travelling pulse.

   It answers to the pointer (tilt + parallax) and to scroll (the sphere
   disperses as the hero leaves). It idles when off-screen or when the
   tab is hidden, and disposes everything it allocated on unmount.
   ═══════════════════════════════════════════════════════════════ */

const COUNT = 720;
const NEIGHBOURS = 2;

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

export default function HeroField() {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = holder.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return; // No WebGL — the CSS fallback behind this stays visible.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

    /* ── geometry ─────────────────────────────────────────────── */
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
       blew the whole sphere out to a solid white disc. */
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
       time on 720 points is a few milliseconds and never runs again. */
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
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const lines = new THREE.LineSegments(lineGeo, lineMat);

    const group = new THREE.Group();
    group.add(points, lines);
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

      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      uniforms.uDisperse.value += (scrollT * 1.5 - uniforms.uDisperse.value) * 0.06;

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      group.rotation.y = t * 0.055 + pointer.x * 0.42;
      group.rotation.x = pointer.y * 0.3;
      group.position.y = -scrollT * 0.55;

      lineMat.opacity = 0.14 * (1 - scrollT * 0.85);
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
      pointMat.dispose();
      lineMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={holder} className="absolute inset-0" aria-hidden="true" />;
}
