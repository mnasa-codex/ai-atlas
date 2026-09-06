'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ===== الشيدر: كرة تتحول تدريجيًا إلى سطح موجي (بحر) ثم ترجع كرة =====
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph; // 0 = كرة كاملة، 1 = موجة كاملة
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vGlint;

  // تشويش بسيط (hash) لإنتاج بقع لمعان عشوائية متحركة على السطح
  float hash(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vec3 pos = position;

    // شكل الموجة: تركيب عدة موجات جيبية بترددات مختلفة تحاكي سطح بحر
    float wave = sin(pos.x * 3.1 + uTime * 0.6) * 0.16
               + cos(pos.z * 2.6 - uTime * 0.5) * 0.13
               + sin((pos.x + pos.z) * 1.7 + uTime * 0.9) * 0.09;
    vec3 wavePos = pos + normal * wave;

    // نبض تنفّس خفيف جدًا حتى بشكل الكرة الطبيعي (إحساس حيوية لا سكون)
    vec3 breathing = pos + normal * sin(uTime * 0.4 + pos.y * 4.0) * 0.006 * (1.0 - uMorph);

    vec3 finalPos = mix(breathing, wavePos, uMorph);

    vGlint = hash(floor(pos * 7.0) + floor(uTime * 0.25));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vGlint;

  void main() {
    vec3 n = normalize(vNormal);
    // توهج الحافة (Fresnel) — يعطي إحساس الغلاف الجوي المضيء حول الكرة
    float fresnel = pow(1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 2.4);

    // تدرج لوني هادئ بين البنفسجي الفضائي والذهبي الفاخر
    vec3 base = mix(uColorA, uColorB, 0.28 + 0.28 * sin(n.y * 2.0 + uTime * 0.2));

    // خطوط طول ودوائر عرض خفيفة — إحساس "خريطة أطلس"
    float gridX = smoothstep(0.985, 1.0, fract(vUv.x * 24.0));
    float gridY = smoothstep(0.985, 1.0, fract(vUv.y * 12.0));
    float grid = max(gridX, gridY) * 0.22;

    // بقع لمعان متحركة تلمع وتخفت بمناطق عشوائية على السطح
    float glint = smoothstep(0.86, 1.0, vGlint) * (0.5 + 0.5 * sin(uTime * 2.2 + vGlint * 24.0));

    vec3 color = base + fresnel * 0.5 * uColorB + grid * uColorB + glint * 1.4 * uColorB;
    gl_FragColor = vec4(color, 1.0);
  }
`;

// غلاف جوي شفاف حول الكرة (Fresnel-only) لإحساس واقعي أكثر
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmosphereFragment = /* glsl */ `
  varying vec3 vNormal;
  uniform vec3 uColor;
  void main() {
    float intensity = pow(max(0.62 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 3.2);
    gl_FragColor = vec4(uColor, 1.0) * intensity;
  }
`;

function clamp01(x: number) { return Math.min(1, Math.max(0, x)); }
function smoothstep01(x: number) { const t = clamp01(x); return t * t * (3 - 2 * t); }

function GlobeMesh({ onFirstMorph }: { onFirstMorph: () => void }) {
  const elapsed = useRef(0);
  const announced = useRef(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uColorA: { value: new THREE.Color('#7B61FF').multiplyScalar(.4) },
    uColorB: { value: new THREE.Color('#C9A227') },
  }), []);

  const atmosphereUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#7B61FF') },
  }), []);

  // دورة الحركة: يثبت كرة ~3.5 ثانية، يتحول لموجة خلال 1.5 ثانية، يثبت موجة ثانيتين، يرجع كرة خلال ثانيتين
  useFrame((_, delta) => {
    // Accumulate active time only: returning to a tab must not jump the morph.
    const step = Math.min(delta, .05);
    elapsed.current += step;
    const t = elapsed.current;
    if (!announced.current && t >= 3.5) { announced.current = true; onFirstMorph(); }
    const cycle = t % 9;
    let morph = 0;
    if (cycle < 3.5) morph = 0;
    else if (cycle < 5) morph = smoothstep01((cycle - 3.5) / 1.5);
    else if (cycle < 7) morph = 1;
    else morph = 1 - smoothstep01((cycle - 7) / 2);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      matRef.current.uniforms.uMorph.value = morph;
    }
    if (meshRef.current) meshRef.current.rotation.y += step * 0.12;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={atmosphereUniforms}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ContextGuard({ onUnavailable }: { onUnavailable: () => void }) {
  const canvas = useThree(state => state.gl.domElement);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [canvas, onUnavailable]);
  return null;
}

export default function Globe3D({ active, onFirstMorph, onUnavailable }: {
  active: boolean; onFirstMorph: () => void; onUnavailable: () => void;
}) {
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFinePointer(pointer.matches);
    update(); pointer.addEventListener('change', update);
    return () => pointer.removeEventListener('change', update);
  }, []);
  return (
    <Canvas camera={{ position: [0, 0, 4.8], fov: 42 }} dpr={[1, 1.4]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ touchAction: 'pan-y', pointerEvents: finePointer ? 'auto' : 'none' }}
      fallback={<div className="atlas-globe-fallback" />}>
      <GlobeMesh onFirstMorph={onFirstMorph} />
      <ContextGuard onUnavailable={onUnavailable} />
      <OrbitControls enabled={active && finePointer} enableDamping={false}
        enableZoom={false} enablePan={false} rotateSpeed={0.35} />
    </Canvas>
  );
}
