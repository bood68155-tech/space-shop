"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function Planet() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  useMemo(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const planetMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color("#6366f1") },
        color2: { value: new THREE.Color("#a855f7") },
        color3: { value: new THREE.Color("#ec4899") },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
        }

        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec3 p = vPosition * 1.5 + time * 0.1;
          float n = fbm(p);

          vec3 baseColor = mix(color1, color2, n);
          baseColor = mix(baseColor, color3, fbm(p * 2.0 + 3.0) * 0.5);

          float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
          baseColor += fresnel * vec3(0.4, 0.3, 0.8) * 0.6;

          float bands = sin(vPosition.y * 8.0 + time * 0.2) * 0.5 + 0.5;
          baseColor = mix(baseColor, baseColor * 1.2, bands * 0.15);

          gl_FragColor = vec4(baseColor, 1.0);
        }
      `,
    });
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color("#818cf8") },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(glowColor, intensity * 0.5);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.03;
    mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.03;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;

      meshRef.current.position.x = mouseCurrent.current.x * 2;
      meshRef.current.position.y = mouseCurrent.current.y * 1.2;

      planetMaterial.uniforms.time.value = t;
    }

    if (glowRef.current) {
      glowRef.current.position.x = meshRef.current.position.x;
      glowRef.current.position.y = meshRef.current.position.y;
      glowRef.current.rotation.y = t * 0.15;
    }

    if (ringRef.current) {
      ringRef.current.position.x = meshRef.current.position.x;
      ringRef.current.position.y = meshRef.current.position.y;
      ringRef.current.rotation.x = -Math.PI * 0.35;
      ringRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} material={planetMaterial}>
        <sphereGeometry args={[1.8, 64, 64]} />
      </mesh>

      <mesh ref={glowRef} material={glowMaterial} scale={1.25}>
        <sphereGeometry args={[1.8, 64, 64]} />
      </mesh>

      <mesh ref={ringRef} rotation={[-Math.PI * 0.35, 0, 0]}>
        <torusGeometry args={[3.0, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#a78bfa"
          transparent
          opacity={0.4}
          emissive="#6366f1"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
