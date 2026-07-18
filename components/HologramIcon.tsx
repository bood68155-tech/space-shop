"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HoloGlow } from "./AtmosphericGlow";

type ShoeType = "sneakers" | "classic" | "boots";

const HOLO_COLORS: Record<ShoeType, { base: string; glow: string; rim: string }> = {
  sneakers: { base: "#00ff88", glow: "#00ccff", rim: "#ff6600" },
  classic: { base: "#00ffcc", glow: "#00aaff", rim: "#ff00ff" },
  boots: { base: "#ffaa00", glow: "#ff6600", rim: "#ff2200" },
};

function createSneakerGeometries() {
  const upper = new THREE.Shape();
  upper.moveTo(-0.7, 0);
  upper.bezierCurveTo(-0.8, 0.12, -0.75, 0.28, -0.5, 0.38);
  upper.bezierCurveTo(-0.3, 0.46, -0.05, 0.5, 0.15, 0.52);
  upper.bezierCurveTo(0.4, 0.54, 0.65, 0.52, 0.85, 0.44);
  upper.bezierCurveTo(1.0, 0.36, 1.1, 0.24, 1.15, 0.12);
  upper.bezierCurveTo(1.2, -0.02, 1.15, -0.14, 1.05, -0.22);
  upper.bezierCurveTo(0.9, -0.34, 0.65, -0.42, 0.35, -0.46);
  upper.bezierCurveTo(0.05, -0.5, -0.3, -0.5, -0.55, -0.46);
  upper.bezierCurveTo(-0.72, -0.42, -0.82, -0.3, -0.86, -0.16);
  upper.bezierCurveTo(-0.88, -0.04, -0.78, 0.06, -0.7, 0);

  const sole = new THREE.Shape();
  sole.moveTo(-0.75, 0);
  sole.bezierCurveTo(-0.85, 0.1, -0.8, 0.26, -0.55, 0.36);
  sole.bezierCurveTo(-0.3, 0.44, -0.05, 0.48, 0.15, 0.5);
  sole.bezierCurveTo(0.4, 0.52, 0.65, 0.48, 0.9, 0.4);
  sole.bezierCurveTo(1.1, 0.3, 1.2, 0.14, 1.22, 0);
  sole.bezierCurveTo(1.22, -0.14, 1.12, -0.24, 1.0, -0.32);
  sole.bezierCurveTo(0.8, -0.42, 0.5, -0.48, 0.2, -0.52);
  sole.bezierCurveTo(-0.1, -0.54, -0.4, -0.54, -0.6, -0.5);
  sole.bezierCurveTo(-0.78, -0.44, -0.88, -0.3, -0.9, -0.16);
  sole.bezierCurveTo(-0.92, -0.02, -0.82, 0.06, -0.75, 0);

  const tongue = new THREE.Shape();
  tongue.moveTo(-0.15, 0);
  tongue.bezierCurveTo(-0.2, 0.15, -0.18, 0.35, -0.1, 0.5);
  tongue.bezierCurveTo(-0.02, 0.6, 0.1, 0.6, 0.18, 0.5);
  tongue.bezierCurveTo(0.26, 0.35, 0.24, 0.15, 0.18, 0);
  tongue.bezierCurveTo(0.1, -0.04, -0.08, -0.04, -0.15, 0);

  const extrude = { steps: 1, depth: 0.3, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.04, bevelSegments: 6 };
  const soleExtrude = { steps: 1, depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 3 };
  const tongueExtrude = { steps: 1, depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 4 };

  return {
    upper: new THREE.ExtrudeGeometry(upper, extrude),
    sole: new THREE.ExtrudeGeometry(sole, soleExtrude),
    tongue: new THREE.ExtrudeGeometry(tongue, tongueExtrude),
  };
}

function createClassicGeometries() {
  const upper = new THREE.Shape();
  upper.moveTo(-0.8, 0);
  upper.bezierCurveTo(-0.9, 0.15, -0.85, 0.35, -0.6, 0.5);
  upper.bezierCurveTo(-0.4, 0.62, -0.15, 0.68, 0.1, 0.7);
  upper.bezierCurveTo(0.35, 0.72, 0.6, 0.7, 0.8, 0.6);
  upper.bezierCurveTo(1.0, 0.5, 1.15, 0.35, 1.2, 0.2);
  upper.bezierCurveTo(1.25, 0.05, 1.2, -0.1, 1.1, -0.2);
  upper.bezierCurveTo(1.0, -0.35, 0.8, -0.45, 0.5, -0.5);
  upper.bezierCurveTo(0.2, -0.55, -0.2, -0.55, -0.5, -0.5);
  upper.bezierCurveTo(-0.7, -0.48, -0.85, -0.35, -0.9, -0.2);
  upper.bezierCurveTo(-0.95, -0.05, -0.85, 0.05, -0.8, 0);

  const sole = new THREE.Shape();
  sole.moveTo(-0.85, 0);
  sole.bezierCurveTo(-0.95, 0.12, -0.9, 0.3, -0.65, 0.42);
  sole.bezierCurveTo(-0.4, 0.52, -0.15, 0.58, 0.1, 0.6);
  sole.bezierCurveTo(0.35, 0.62, 0.6, 0.58, 0.85, 0.48);
  sole.bezierCurveTo(1.05, 0.38, 1.2, 0.22, 1.25, 0.08);
  sole.bezierCurveTo(1.3, -0.08, 1.22, -0.2, 1.15, -0.3);
  sole.bezierCurveTo(1.0, -0.42, 0.75, -0.52, 0.45, -0.58);
  sole.bezierCurveTo(0.15, -0.62, -0.25, -0.62, -0.55, -0.58);
  sole.bezierCurveTo(-0.75, -0.52, -0.92, -0.38, -0.98, -0.22);
  sole.bezierCurveTo(-1.02, -0.08, -0.92, 0.05, -0.85, 0);

  const extrude = { steps: 1, depth: 0.35, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 8 };
  const soleExtrude = { steps: 1, depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 4 };

  return {
    upper: new THREE.ExtrudeGeometry(upper, extrude),
    sole: new THREE.ExtrudeGeometry(sole, soleExtrude),
  };
}

function createBootGeometries() {
  const shaft = new THREE.Shape();
  shaft.moveTo(-0.45, 0);
  shaft.bezierCurveTo(-0.55, 0.1, -0.6, 0.3, -0.55, 0.55);
  shaft.bezierCurveTo(-0.5, 0.8, -0.42, 1.1, -0.35, 1.35);
  shaft.bezierCurveTo(-0.3, 1.5, -0.2, 1.58, -0.05, 1.6);
  shaft.bezierCurveTo(0.1, 1.62, 0.25, 1.55, 0.35, 1.42);
  shaft.bezierCurveTo(0.48, 1.25, 0.55, 1.0, 0.58, 0.7);
  shaft.bezierCurveTo(0.6, 0.45, 0.58, 0.2, 0.55, 0.05);
  shaft.bezierCurveTo(0.52, -0.08, 0.45, -0.18, 0.35, -0.25);
  shaft.bezierCurveTo(0.2, -0.34, 0.0, -0.38, -0.2, -0.38);
  shaft.bezierCurveTo(-0.35, -0.36, -0.44, -0.28, -0.48, -0.16);
  shaft.bezierCurveTo(-0.5, -0.05, -0.48, 0.04, -0.45, 0);

  const foot = new THREE.Shape();
  foot.moveTo(-0.75, 0);
  foot.bezierCurveTo(-0.85, 0.1, -0.8, 0.28, -0.58, 0.38);
  foot.bezierCurveTo(-0.35, 0.46, -0.1, 0.52, 0.1, 0.54);
  foot.bezierCurveTo(0.35, 0.56, 0.6, 0.52, 0.82, 0.42);
  foot.bezierCurveTo(1.0, 0.32, 1.12, 0.18, 1.18, 0.04);
  foot.bezierCurveTo(1.22, -0.1, 1.16, -0.22, 1.05, -0.3);
  foot.bezierCurveTo(0.88, -0.4, 0.65, -0.48, 0.38, -0.52);
  foot.bezierCurveTo(0.1, -0.56, -0.2, -0.56, -0.48, -0.52);
  foot.bezierCurveTo(-0.68, -0.46, -0.82, -0.34, -0.86, -0.2);
  foot.bezierCurveTo(-0.9, -0.06, -0.82, 0.06, -0.75, 0);

  const sole = new THREE.Shape();
  sole.moveTo(-0.8, 0);
  sole.bezierCurveTo(-0.9, 0.1, -0.85, 0.26, -0.62, 0.36);
  sole.bezierCurveTo(-0.38, 0.44, -0.12, 0.5, 0.1, 0.52);
  sole.bezierCurveTo(0.35, 0.54, 0.6, 0.5, 0.86, 0.4);
  sole.bezierCurveTo(1.05, 0.3, 1.18, 0.14, 1.22, 0);
  sole.bezierCurveTo(1.22, -0.14, 1.14, -0.24, 1.02, -0.32);
  sole.bezierCurveTo(0.82, -0.42, 0.55, -0.5, 0.25, -0.54);
  sole.bezierCurveTo(-0.05, -0.56, -0.35, -0.56, -0.55, -0.52);
  sole.bezierCurveTo(-0.72, -0.46, -0.86, -0.32, -0.9, -0.18);
  sole.bezierCurveTo(-0.94, -0.04, -0.86, 0.06, -0.8, 0);

  const extrude = { steps: 1, depth: 0.32, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 6 };
  const soleExtrude = { steps: 1, depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 4 };

  return {
    shaft: new THREE.ExtrudeGeometry(shaft, extrude),
    foot: new THREE.ExtrudeGeometry(foot, extrude),
    sole: new THREE.ExtrudeGeometry(sole, soleExtrude),
  };
}

function createGeometries(type: ShoeType) {
  switch (type) {
    case "sneakers": return createSneakerGeometries();
    case "classic": return createClassicGeometries();
    case "boots": return createBootGeometries();
  }
}

function useHoloMaterial(type: ShoeType) {
  const colors = HOLO_COLORS[type];
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(colors.base) },
        glowColor: { value: new THREE.Color(colors.glow) },
        rimColor: { value: new THREE.Color(colors.rim) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
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
          holoColor *= flicker(time);
          float edgeGlow = fresnel * 1.5;
          holoColor += rimColor * edgeGlow * 0.3;

          float alpha = mix(0.35, 0.85, fresnel);
          alpha *= scanIntensity;
          alpha += edgeGlow * 0.2;
          alpha *= flicker(time);
          alpha = clamp(alpha, 0.15, 0.9);

          gl_FragColor = vec4(holoColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [colors.base, colors.glow, colors.rim]);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return material;
}

function useWireMaterial(type: ShoeType) {
  const colors = HOLO_COLORS[type];
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(colors.glow) },
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
  }, [colors.glow]);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return material;
}

function SneakerModel({ holoMat, wireMat }: { holoMat: THREE.ShaderMaterial; wireMat: THREE.ShaderMaterial }) {
  const geos = useMemo(() => createSneakerGeometries(), []);
  return (
    <group>
      <mesh geometry={geos.upper} material={holoMat} position={[0, 0.08, -0.15]} />
      <mesh geometry={geos.upper} material={wireMat} position={[0, 0.08, -0.15]} />
      <mesh geometry={geos.sole} material={holoMat} position={[0, -0.04, -0.05]} />
      <mesh geometry={geos.sole} material={wireMat} position={[0, -0.04, -0.05]} />
      <mesh geometry={geos.tongue} material={holoMat} position={[0, 0.12, -0.15]} />
      <mesh geometry={geos.tongue} material={wireMat} position={[0, 0.12, -0.15]} />
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.15 + i * 0.12, 0.2 + i * 0.02, -0.15]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.01, 0.013, 0.08, 6]} />
          <primitive object={holoMat} attach="material" />
        </mesh>
      ))}
      <mesh position={[0.75, 0.28, -0.15]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <primitive object={holoMat} attach="material" />
      </mesh>
    </group>
  );
}

function ClassicModel({ holoMat, wireMat }: { holoMat: THREE.ShaderMaterial; wireMat: THREE.ShaderMaterial }) {
  const geos = useMemo(() => createClassicGeometries(), []);
  return (
    <group>
      <mesh geometry={geos.upper} material={holoMat} position={[0, 0.12, -0.17]} />
      <mesh geometry={geos.upper} material={wireMat} position={[0, 0.12, -0.17]} />
      <mesh geometry={geos.sole} material={holoMat} position={[0, -0.02, -0.06]} />
      <mesh geometry={geos.sole} material={wireMat} position={[0, -0.02, -0.06]} />
      <mesh position={[-0.55, 0.35, -0.17]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <primitive object={holoMat} attach="material" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.25 + i * 0.16, 0.08 - i * 0.012, -0.17]}>
          <cylinderGeometry args={[0.012, 0.015, 0.1, 6]} />
          <primitive object={holoMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function BootModel({ holoMat, wireMat }: { holoMat: THREE.ShaderMaterial; wireMat: THREE.ShaderMaterial }) {
  const geos = useMemo(() => createBootGeometries(), []);
  return (
    <group>
      <mesh geometry={geos.shaft} material={holoMat} position={[0, -0.05, -0.16]} />
      <mesh geometry={geos.shaft} material={wireMat} position={[0, -0.05, -0.16]} />
      <mesh geometry={geos.foot} material={holoMat} position={[0, -0.05, -0.16]} />
      <mesh geometry={geos.foot} material={wireMat} position={[0, -0.05, -0.16]} />
      <mesh geometry={geos.sole} material={holoMat} position={[0, -0.18, -0.04]} />
      <mesh geometry={geos.sole} material={wireMat} position={[0, -0.18, -0.04]} />
      <mesh position={[-0.3, 1.18, -0.16]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <primitive object={holoMat} attach="material" />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[-0.1 + i * 0.05, -0.05 + i * 0.22, -0.16]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.01, 0.013, 0.06, 6]} />
          <primitive object={holoMat} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, -0.24, 0]}>
        <boxGeometry args={[0.9, 0.06, 0.45]} />
        <primitive object={holoMat} attach="material" />
      </mesh>
    </group>
  );
}

export default function HologramIcon({ type, scale = 1 }: { type: ShoeType; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const holoMat = useHoloMaterial(type);
  const wireMat = useWireMaterial(type);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.35;
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.06;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <HoloGlow
        color={HOLO_COLORS[type].glow}
        secondaryColor={HOLO_COLORS[type].rim}
        radius={0.85}
        height={0.65}
      />
      {type === "sneakers" && <SneakerModel holoMat={holoMat} wireMat={wireMat} />}
      {type === "classic" && <ClassicModel holoMat={holoMat} wireMat={wireMat} />}
      {type === "boots" && <BootModel holoMat={holoMat} wireMat={wireMat} />}
    </group>
  );
}
