"use client";

import { useRef, useMemo, useCallback, createContext, useContext } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface GlowContextValue {
  mouseNDC: React.MutableRefObject<THREE.Vector2>;
}

const GlowContext = createContext<GlowContextValue | null>(null);

export function GlowProvider({ children }: { children: React.ReactNode }) {
  const mouseNDC = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  useFrame((state) => {
    mouseNDC.current.x = (state.pointer.x * viewport.width) / 2;
    mouseNDC.current.y = (state.pointer.y * viewport.height) / 2;
  });

  return (
    <GlowContext.Provider value={{ mouseNDC }}>
      {children}
    </GlowContext.Provider>
  );
}

function useGlowContext() {
  return useContext(GlowContext);
}

interface AtmosphericGlowProps {
  color?: string;
  secondaryColor?: string;
  scale?: number;
  intensity?: number;
  power?: number;
  pulseSpeed?: number;
  interactive?: boolean;
  children?: React.ReactNode;
}

export function AtmosphericGlow({
  color = "#6366f1",
  secondaryColor = "#a855f7",
  scale = 1.35,
  intensity = 0.45,
  power = 3.5,
  pulseSpeed = 1.0,
  interactive = true,
  children,
}: AtmosphericGlowProps) {
  const glowRef = useRef<THREE.Mesh>(null!);
  const innerGlowRef = useRef<THREE.Mesh>(null!);
  const ctx = useGlowContext();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(color) },
        secondaryColor: { value: new THREE.Color(secondaryColor) },
        intensity: { value: intensity },
        power: { value: power },
        mouseOffset: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        uniform float time;
        uniform vec2 mouseOffset;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;
          vec3 pos = position;
          float breathe = sin(time * ${pulseSpeed.toFixed(1)}) * 0.02;
          pos *= 1.0 + breathe;
          pos.x += mouseOffset.x * 0.015;
          pos.y += mouseOffset.y * 0.015;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 secondaryColor;
        uniform float intensity;
        uniform float power;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), power);

          float pulse = sin(time * 1.5) * 0.1 + 0.9;
          fresnel *= pulse;

          float scan = sin(vWorldPos.y * 20.0 + time * 2.0) * 0.5 + 0.5;
          scan = smoothstep(0.4, 0.6, scan) * 0.15;

          vec3 color = mix(baseColor, secondaryColor, fresnel * 0.6 + scan);
          color += fresnel * secondaryColor * 0.3;

          float alpha = fresnel * intensity + scan * fresnel * 0.5;
          alpha = clamp(alpha, 0.0, 0.7);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }, [color, secondaryColor, intensity, power, pulseSpeed]);

  const innerMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(color) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 6.0);
          float pulse = sin(time * 2.0) * 0.08 + 0.92;
          vec3 color = baseColor * 1.5;
          float alpha = fresnel * 0.25 * pulse;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }, [color]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    material.uniforms.time.value = t;
    innerMaterial.uniforms.time.value = t;

    if (interactive && ctx?.mouseNDC.current) {
      material.uniforms.mouseOffset.value.copy(ctx.mouseNDC.current);
    }
  });

  return (
    <group>
      {children}
      <mesh ref={glowRef} material={material} scale={scale} renderOrder={-1}>
        <sphereGeometry args={[1, 48, 24]} />
      </mesh>
      <mesh ref={innerGlowRef} material={innerMaterial} scale={scale * 0.98} renderOrder={-1}>
        <sphereGeometry args={[1, 32, 16]} />
      </mesh>
    </group>
  );
}

interface HoloGlowProps {
  color: string;
  secondaryColor: string;
  radius?: number;
  height?: number;
}

export function HoloGlow({
  color,
  secondaryColor,
  radius = 0.8,
  height = 0.7,
}: HoloGlowProps) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(color) },
        secondaryColor: { value: new THREE.Color(secondaryColor) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 secondaryColor;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

          float pulse = sin(time * 1.8) * 0.12 + 0.88;
          fresnel *= pulse;

          float scan = sin(vWorldPos.y * 30.0 + time * 3.0) * 0.5 + 0.5;
          scan = smoothstep(0.45, 0.55, scan) * 0.12;

          float dataPulse = sin(vWorldPos.y * 60.0 + time * 6.0) * 0.5 + 0.5;
          dataPulse = smoothstep(0.92, 1.0, dataPulse) * 0.2;

          vec3 color = mix(baseColor, secondaryColor, fresnel * 0.5 + scan);
          color += secondaryColor * fresnel * 0.4;

          float alpha = fresnel * 0.35 + scan * fresnel * 0.3 + dataPulse * fresnel * 0.2;
          alpha = clamp(alpha, 0.0, 0.55);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }, [color, secondaryColor]);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh material={material} scale={[radius, height, radius]} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}
