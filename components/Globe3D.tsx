"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

function Earth({ paused }: { paused: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useTexture(
    `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/textures/earth-day.jpg`,
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  useFrame((_, delta) => {
    if (mesh.current && !paused)
      mesh.current.rotation.y += Math.min(delta, 0.05) * 0.08;
  });
  return (
    <group rotation={[0.1, 0, -0.18]}>
      <mesh ref={mesh} rotation={[0, 2.5, 0]}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshPhongMaterial
          map={texture}
          color="#a9cfff"
          shininess={18}
          specular="#245f99"
        />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          vertexShader={`varying vec3 n; varying vec3 v; void main(){ vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p; }`}
          fragmentShader={`varying vec3 n; varying vec3 v; void main(){ float glow=pow(max(0.,1.-abs(dot(normalize(n),normalize(v)))),2.5); gl_FragColor=vec4(.2,.48,1.,glow*.8); }`}
        />
      </mesh>
    </group>
  );
}

export default function Globe3D({ paused }: { paused: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.9], fov: 42 }}
      dpr={[1, 1.5]}
      frameloop={paused ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3, 3, 4]} intensity={2.4} color="#c9deff" />
      <directionalLight
        position={[3, -1, -2]}
        intensity={1.2}
        color="#9064f5"
      />
      <Suspense fallback={null}>
        <Earth paused={paused} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.4}
        enableDamping
      />
    </Canvas>
  );
}
