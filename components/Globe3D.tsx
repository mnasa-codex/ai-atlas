"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";

function Earth({ paused }: { paused: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useTexture(
    `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/textures/earth-day.jpg`,
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  useFrame((_, delta) => {
    if (mesh.current && !paused)
      mesh.current.rotation.y += Math.min(delta, 0.05) * 0.075;
  });

  return (
    <group rotation={[0.08, 0, -0.2]}>
      <mesh ref={mesh} rotation={[0, 2.5, 0]}>
        <sphereGeometry args={[1.55, 72, 72]} />
        <meshPhysicalMaterial
          map={texture}
          color="#d6e6ff"
          roughness={0.72}
          metalness={0.06}
          clearcoat={0.2}
          clearcoatRoughness={0.55}
        />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[1.55, 56, 56]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          vertexShader={`varying vec3 normalDirection; varying vec3 viewDirection;
            void main() {
              vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
              normalDirection = normalize(normalMatrix * normal);
              viewDirection = normalize(-viewPosition.xyz);
              gl_Position = projectionMatrix * viewPosition;
            }`}
          fragmentShader={`varying vec3 normalDirection; varying vec3 viewDirection;
            void main() {
              float rim = pow(max(0.0, 1.0 - abs(dot(normalize(normalDirection), normalize(viewDirection)))), 2.25);
              vec3 color = mix(vec3(0.18, 0.48, 1.0), vec3(0.63, 0.38, 1.0), rim);
              gl_FragColor = vec4(color, rim * 0.72);
            }`}
        />
      </mesh>
    </group>
  );
}

function OrbitalHalo({ paused }: { paused: boolean }) {
  const orbit = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (orbit.current && !paused)
      orbit.current.rotation.z += Math.min(delta, 0.05) * 0.045;
  });

  return (
    <group ref={orbit} rotation={[1.08, 0.22, 0.38]}>
      <mesh>
        <torusGeometry args={[1.95, 0.006, 8, 180]} />
        <meshBasicMaterial
          color="#9ab9ff"
          transparent
          opacity={0.36}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0.16, 0.08, 0]}>
        <torusGeometry args={[2.14, 0.0035, 8, 180]} />
        <meshBasicMaterial
          color="#b9a7ff"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[1.91, 0.39, 0]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshBasicMaterial color="#dceaff" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Globe3D({ paused }: { paused: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={[1, 1.5]}
      frameloop={paused ? "demand" : "always"}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <ambientLight intensity={0.42} />
      <hemisphereLight
        args={["#c9ddff", "#08091d", 0.75]}
      />
      <directionalLight
        position={[-3.5, 3, 4.5]}
        intensity={2.8}
        color="#d8e7ff"
      />
      <directionalLight
        position={[3, -1, -2]}
        intensity={1.55}
        color="#8c63ff"
      />
      <pointLight
        position={[-3, -2, 2]}
        intensity={0.7}
        color="#75cfff"
      />
      <Stars
        radius={18}
        depth={8}
        count={240}
        factor={1.3}
        saturation={0.15}
        fade
        speed={paused ? 0 : 0.15}
      />
      <Suspense fallback={null}>
        <Earth paused={paused} />
        <OrbitalHalo paused={paused} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.36}
        enableDamping
        dampingFactor={0.055}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.72}
      />
    </Canvas>
  );
}
