import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial, Sphere, Torus, Octahedron, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// Holographic Floating Subscription Badge in 3D
function HolographicCard({ position, color, label, iconText, index }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4 + index * 1.2) * 0.12;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + index * 1.5) * 0.15;
    }
  });

  return (
    <group position={position}>
      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.6}>
        <group
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.08 : 1}
        >
          {/* Card Glass Body */}
          <mesh>
            <boxGeometry args={[1.7, 0.9, 0.05]} />
            <meshPhysicalMaterial
              color="#0d1225"
              transparent
              opacity={0.88}
              metalness={0.4}
              roughness={0.15}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Glowing Border Edge */}
          <mesh scale={[1.02, 1.04, 1.1]}>
            <boxGeometry args={[1.7, 0.9, 0.04]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={hovered ? 0.8 : 0.4}
              wireframe
            />
          </mesh>

          {/* Accent light pill on the card */}
          <mesh position={[-0.55, 0, 0.03]}>
            <circleGeometry args={[0.22, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.85} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

// Central futuristic STAR BYTE core
function StarByteCore() {
  const coreRef = useRef();
  const innerRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.25;
      coreRef.current.rotation.x = Math.sin(t * 0.15) * 0.2;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.4;
      innerRef.current.rotation.z = t * 0.3;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.4;
      ring1Ref.current.rotation.x = 0.85 + Math.sin(t * 0.2) * 0.08;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.35;
      ring2Ref.current.rotation.y = 0.6 + Math.cos(t * 0.25) * 0.1;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = -t * 0.28;
      ring3Ref.current.rotation.z = Math.PI / 4 + Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      {/* Outer Distorting Plasma Sphere */}
      <Sphere ref={coreRef} args={[0.95, 64, 64]}>
        <MeshDistortMaterial
          color="#6366f1"
          distort={0.3}
          speed={2.2}
          metalness={0.7}
          roughness={0.15}
          transparent
          opacity={0.85}
          emissive="#4f46e5"
          emissiveIntensity={0.4}
        />
      </Sphere>

      {/* Inner Faceted Crystal Core */}
      <Icosahedron ref={innerRef} args={[0.55, 0]}>
        <meshPhysicalMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </Icosahedron>

      {/* Ambient Inner Glowing Orb */}
      <Sphere args={[0.4, 32, 32]}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.7} />
      </Sphere>

      {/* Orbital Ring 1 - Electric Purple */}
      <Torus ref={ring1Ref} args={[1.65, 0.02, 16, 100]}>
        <meshBasicMaterial color="#818cf8" transparent opacity={0.65} />
      </Torus>

      {/* Orbital Ring 2 - Cyan Energy */}
      <Torus ref={ring2Ref} args={[2.05, 0.018, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
      </Torus>

      {/* Orbital Ring 3 - Deep Violet Outer Halo */}
      <Torus ref={ring3Ref} args={[2.45, 0.014, 16, 100]} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <meshBasicMaterial color="#a855f7" transparent opacity={0.35} />
      </Torus>

      {/* Soft Volumetric Glow Halo */}
      <Sphere args={[1.35, 32, 32]}>
        <meshBasicMaterial color="#6366f1" transparent opacity={0.06} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

// Ambient Floating Particle Dust
function ParticleField({ count = 180 }) {
  const points = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.018;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.04;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#818cf8"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

// Parallax Camera Rig
function CameraRig({ mousePosition }) {
  const { camera } = useThree();
  const targetX = useRef(0);
  const targetY = useRef(0);

  useFrame(() => {
    targetX.current += (mousePosition.current.x * 0.7 - targetX.current) * 0.04;
    targetY.current += (mousePosition.current.y * 0.35 - targetY.current) * 0.04;
    camera.position.x += (targetX.current - camera.position.x) * 0.05;
    camera.position.y += (targetY.current - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Background Floating 3D Geometric Artifacts
function FloatingShapes() {
  const shapes = useMemo(() => [
    { position: [-7.5, 3.2, -6], color: '#8b5cf6', scale: 0.35 },
    { position: [7.8, -2.5, -5], color: '#06b6d4', scale: 0.3 },
    { position: [-6.2, -3.8, -4], color: '#a78bfa', scale: 0.28 },
    { position: [7.0, 3.8, -7], color: '#6366f1', scale: 0.32 },
    { position: [-8.5, 0.5, -9], color: '#818cf8', scale: 0.22 },
  ], []);

  return (
    <>
      {shapes.map((shape, i) => (
        <Float key={i} speed={1.2 + i * 0.25} rotationIntensity={0.4} floatIntensity={0.7}>
          <group position={shape.position} scale={shape.scale}>
            <Octahedron>
              <meshPhysicalMaterial
                color={shape.color}
                metalness={0.75}
                roughness={0.15}
                transparent
                opacity={0.5}
                emissive={shape.color}
                emissiveIntensity={0.12}
              />
            </Octahedron>
          </group>
        </Float>
      ))}
    </>
  );
}

const HOLOGRAPHIC_CARDS = [
  { position: [-4.6, 1.8, -3], color: '#06b6d4', label: 'ChatGPT Plus', iconText: 'GPT' },
  { position: [4.6, 1.8, -3], color: '#8b5cf6', label: 'Gemini Pro', iconText: 'GEM' },
  { position: [-4.2, -1.9, -2.5], color: '#ef4444', label: 'Netflix 4K', iconText: 'NFLX' },
  { position: [4.2, -1.9, -2.5], color: '#f59e0b', label: 'Canva Pro', iconText: 'CNV' },
  { position: [-2.6, 3.2, -5], color: '#10b981', label: 'NordVPN', iconText: 'VPN' },
  { position: [2.6, 3.2, -5], color: '#6366f1', label: 'Coursera Plus', iconText: 'EDU' },
];

export default function HeroScene() {
  const mousePosition = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsLowPower(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    mousePosition.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: -(e.clientY / window.innerHeight - 0.5) * 2
    };
  };

  const particleCount = isMobile ? 50 : isLowPower ? 70 : 160;
  const showCards = !isMobile;

  return (
    <div
      style={{ position: 'absolute', inset: 0 }}
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 55 }}
        dpr={Math.min(window.devicePixelRatio, isMobile ? 1 : 2)}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        {/* Lights */}
        <ambientLight intensity={0.45} />
        <pointLight position={[8, 8, 8]} intensity={1.2} color="#6366f1" />
        <pointLight position={[-8, -8, -6]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[0, 4, 4]} intensity={0.9} color="#8b5cf6" />
        <directionalLight position={[0, 8, 4]} intensity={0.6} />

        {/* Deep Stars Background */}
        <Stars
          radius={60}
          depth={50}
          count={isMobile ? 400 : 1800}
          factor={3.8}
          saturation={0.3}
          fade
          speed={0.4}
        />

        {/* Central Star Byte Core */}
        <StarByteCore />

        {/* Holographic 3D Floating Product Cards */}
        {showCards && HOLOGRAPHIC_CARDS.map((card, i) => (
          <HolographicCard key={i} {...card} index={i} />
        ))}

        {/* Ambient Geometric Shapes */}
        {!isLowPower && <FloatingShapes />}

        {/* Particle Cloud */}
        <ParticleField count={particleCount} />

        {/* Mouse Parallax Rig */}
        {!isLowPower && <CameraRig mousePosition={mousePosition} />}

        {/* Atmospheric Depth Fog */}
        <fog attach="fog" args={['#04060f', 18, 55]} />
      </Canvas>
    </div>
  );
}
