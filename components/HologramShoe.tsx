"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createShoeGeometry() {
  const shape = new THREE.Shape();

  shape.moveTo(-0.8, 0);
  shape.bezierCurveTo(-0.9, 0.15, -0.85, 0.35, -0.6, 0.5);
  shape.bezierCurveTo(-0.4, 0.62, -0.15, 0.68, 0.1, 0.7);
  shape.bezierCurveTo(0.35, 0.72, 0.6, 0.7, 0.8, 0.6);
  shape.bezierCurveTo(1.0, 0.5, 1.15, 0.35, 1.2, 0.2);
  shape.bezierCurveTo(1.25, 0.05, 1.2, -0.1, 1.1, -0.2);
  shape.bezierCurveTo(1.0, -0.35, 0.8, -0.45, 0.5, -0.5);
  shape.bezierCurveTo(0.2, -0.55, -0.2, -0.55, -0.5, -0.5);
  shape.bezierCurveTo(-0.7, -0.48, -0.85, -0.35, -0.9, -0.2);
  shape.bezierCurveTo(-0.95, -0.05, -0.85, 0.05, -0.8, 0);

  const extrudeSettings = {
    steps: 1,
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 8,
  };

  const soleShape = new THREE.Shape();
  soleShape.moveTo(-0.85, 0);
  soleShape.bezierCurveTo(-0.95, 0.12, -0.9, 0.3, -0.65, 0.42);
  soleShape.bezierCurveTo(-0.4, 0.52, -0.15, 0.58, 0.1, 0.6);
  soleShape.bezierCurveTo(0.35, 0.62, 0.6, 0.58, 0.85, 0.48);
  soleShape.bezierCurveTo(1.05, 0.38, 1.2, 0.22, 1.25, 0.08);
  soleShape.bezierCurveTo(1.3, -0.08, 1.22, -0.2, 1.15, -0.3);
  soleShape.bezierCurveTo(1.0, -0.42, 0.75, -0.52, 0.45, -0.58);
  soleShape.bezierCurveTo(0.15, -0.62, -0.25, -0.62, -0.55, -0.58);
  soleShape.bezierCurveTo(-0.75, -0.52, -0.92, -0.38, -0.98, -0.22);
  soleShape.bezierCurveTo(-1.02, -0.08, -0.92, 0.05, -0.85, 0);

  const soleExtrudeSettings = {
    steps: 1,
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 4,
  };

  const upperGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const soleGeom = new THREE.ExtrudeGeometry(soleShape, soleExtrudeSettings);

  return { upperGeom, soleGeom };
}

function HolographicMaterial() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color("#00ffcc") },
        glowColor: { value: new THREE.Color("#00aaff") },
        rimColor: { value: new THREE.Color("#ff00ff") },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 glowColor;
        uniform vec3 rimColor;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        float scanline(float y, float speed, float density) {
          return sin((y + time * speed) * density) * 0.5 + 0.5;
        }

        float flicker(float t) {
          return 0.95 + 0.05 * sin(t * 8.0) * sin(t * 13.0) * sin(t * 21.0);
        }

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

          float scan = scanline(vWorldPosition.y, 2.0, 40.0);
          float scan2 = scanline(vWorldPosition.y, -1.5, 25.0);

          float dataFlow = scanline(vWorldPosition.y, 8.0, 80.0);
          dataFlow *= step(0.97, scanline(vWorldPosition.x, 3.0, 15.0));

          vec3 holoColor = mix(baseColor, glowColor, fresnel);
          holoColor = mix(holoColor, rimColor, fresnel * fresnel * 0.6);

          float scanIntensity = mix(0.7, 1.0, scan * 0.5 + scan2 * 0.3);
          holoColor *= scanIntensity;

          holoColor += dataFlow * glowColor * 0.4;

          float flickerVal = flicker(time);
          holoColor *= flickerVal;

          float edgeGlow = fresnel * 1.5;
          holoColor += rimColor * edgeGlow * 0.3;

          float alpha = mix(0.35, 0.85, fresnel);
          alpha *= scanIntensity;
          alpha += edgeGlow * 0.2;
          alpha *= flickerVal;
          alpha = clamp(alpha, 0.15, 0.9);

          gl_FragColor = vec4(holoColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return material;
}

function WireframeOverlay() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color("#00ffaa") },
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec3 vPosition;

        void main() {
          float scan = sin((vPosition.y + time * 1.5) * 30.0) * 0.5 + 0.5;
          float alpha = scan * 0.15;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return material;
}

export default function HologramShoe({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const holoMat = HolographicMaterial();
  const wireMat = WireframeOverlay();

  const { upperGeom, soleGeom } = useMemo(() => createShoeGeometry(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.4;
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.12;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh geometry={upperGeom} material={holoMat} position={[0, 0.12, -0.17]} />
      <mesh geometry={upperGeom} material={wireMat} position={[0, 0.12, -0.17]} />

      <mesh geometry={soleGeom} material={holoMat} position={[0, -0.02, -0.06]} />
      <mesh geometry={soleGeom} material={wireMat} position={[0, -0.02, -0.06]} />

      <mesh position={[-0.55, 0.35, -0.17]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <primitive object={holoMat} attach="material" />
      </mesh>

      <group position={[0, 0.15, -0.17]} rotation={[0, 0, 0.05]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[-0.25 + i * 0.18, 0.08 - i * 0.015, 0]}>
            <cylinderGeometry args={[0.015, 0.018, 0.12, 8]} />
            <primitive object={holoMat} attach="material" />
          </mesh>
        ))}
      </group>

      <pointLight position={[0, 0.5, 0.5]} intensity={0.8} color="#00ffcc" distance={3} />
      <pointLight position={[0.5, 0, 0.5]} intensity={0.4} color="#ff00ff" distance={2} />
    </group>
  );
}
