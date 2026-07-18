"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function SaturnBody() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float n = i.x + i.y * 157.0 + 113.0 * i.z;
          return mix(
            mix(mix(hash(vec2(n + 0.0, 0.0)), hash(vec2(n + 1.0, 0.0)), f.x),
                mix(hash(vec2(n + 157.0, 0.0)), hash(vec2(n + 158.0, 0.0)), f.x), f.y),
            mix(mix(hash(vec2(n + 113.0, 0.0)), hash(vec2(n + 114.0, 0.0)), f.x),
                mix(hash(vec2(n + 270.0, 0.0)), hash(vec2(n + 271.0, 0.0)), f.x), f.y),
            f.z
          );
        }

        float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.5;
          vec3 shift = vec3(100.0);
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p = p * 2.0 + shift;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          float lat = vUv.y;

          vec3 paleGold = vec3(0.82, 0.75, 0.55);
          vec3 warmBeige = vec3(0.78, 0.68, 0.48);
          vec3 amber = vec3(0.72, 0.58, 0.35);
          vec3 lightCream = vec3(0.88, 0.82, 0.65);
          vec3 darkBand = vec3(0.55, 0.45, 0.28);

          float bands = sin(lat * 40.0) * 0.5 + 0.5;
          bands = smoothstep(0.3, 0.7, bands);

          float largeBands = sin(lat * 12.0 + 0.5) * 0.5 + 0.5;

          float detail = fbm(vec3(vUv.x * 20.0, lat * 30.0, time * 0.02));
          float turbulence = fbm(vec3(vUv.x * 8.0, lat * 15.0, 3.0)) * 0.15;

          vec3 baseColor = mix(paleGold, warmBeige, largeBands);
          baseColor = mix(baseColor, amber, bands * 0.3);
          baseColor = mix(baseColor, lightCream, detail * 0.2);
          baseColor = mix(baseColor, darkBand, smoothstep(0.6, 0.8, largeBands) * 0.4);

          float stormBelt = smoothstep(0.45, 0.5, lat) * smoothstep(0.55, 0.5, lat);
          baseColor = mix(baseColor, amber * 0.85, stormBelt * 0.5);
          baseColor += turbulence * vec3(0.05, 0.03, -0.02);

          float polarDark = smoothstep(0.85, 1.0, lat) + smoothstep(0.15, 0.0, lat);
          baseColor = mix(baseColor, vec3(0.45, 0.40, 0.30), polarDark * 0.6);

          float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
          baseColor += fresnel * vec3(0.15, 0.12, 0.08);

          vec3 lightDir = normalize(vec3(1.0, 0.5, 1.0));
          float diffuse = max(dot(vNormal, lightDir), 0.0);
          diffuse = diffuse * 0.6 + 0.4;

          baseColor *= diffuse;

          gl_FragColor = vec4(baseColor, 1.0);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[1.6, 128, 64]} />
    </mesh>
  );
}

function SaturnRing() {
  const ringRef = useRef<THREE.Mesh>(null!);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }

        void main() {
          vec2 centeredUv = vUv - 0.5;
          float dist = length(centeredUv) * 2.0;

          float innerEdge = smoothstep(0.42, 0.44, dist);
          float outerEdge = smoothstep(0.98, 0.95, dist);
          float mask = innerEdge * outerEdge;

          float cassini = 1.0 - smoothstep(0.0, 0.015, abs(dist - 0.68));
          float enckeGap = 1.0 - smoothstep(0.0, 0.008, abs(dist - 0.88));
          float huygensGap = 1.0 - smoothstep(0.0, 0.01, abs(dist - 0.55));

          float ringPattern = 0.0;
          ringPattern += sin(dist * 80.0) * 0.3;
          ringPattern += sin(dist * 45.0 + 1.5) * 0.2;
          ringPattern += sin(dist * 120.0 - 0.8) * 0.15;
          ringPattern += noise(vec2(dist * 60.0, 0.0)) * 0.25;
          ringPattern = ringPattern * 0.5 + 0.5;

          vec3 brightRing = vec3(0.82, 0.76, 0.62);
          vec3 midRing = vec3(0.72, 0.65, 0.50);
          vec3 darkRing = vec3(0.50, 0.44, 0.32);
          vec3 iceRing = vec3(0.88, 0.85, 0.78);

          float zone = dist;
          vec3 ringColor;
          if (zone < 0.55) {
            ringColor = mix(brightRing, iceRing, ringPattern);
          } else if (zone < 0.68) {
            ringColor = mix(midRing, brightRing, ringPattern);
          } else if (zone < 0.88) {
            ringColor = mix(darkRing, midRing, ringPattern);
          } else {
            ringColor = mix(midRing, iceRing, ringPattern);
          }

          float density = mask * (1.0 - cassini) * (1.0 - enckeGap) * (1.0 - huygensGap);
          density *= (0.7 + ringPattern * 0.3);

          float angle = atan(centeredUv.y, centeredUv.x);
          float shimmer = sin(angle * 3.0 + dist * 20.0 + time * 0.3) * 0.05;
          density += shimmer;

          float lightAngle = dot(vNormal, normalize(vec3(1.0, 0.5, 1.0)));
          float lighting = lightAngle * 0.3 + 0.7;

          gl_FragColor = vec4(ringColor * lighting, density * 0.85);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={ringRef} material={material} rotation={[Math.PI * 0.42, 0, 0]}>
      <ringGeometry args={[1.9, 4.2, 128]} />
    </mesh>
  );
}

function SaturnAtmosphere() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          vec3 color = mix(vec3(0.85, 0.78, 0.55), vec3(0.9, 0.82, 0.6), intensity);
          gl_FragColor = vec4(color, intensity * 0.35);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh material={material} scale={1.08}>
      <sphereGeometry args={[1.6, 64, 32]} />
    </mesh>
  );
}

export default function Saturn() {
  const groupRef = useRef<THREE.Group>(null!);
  const driftRef = useRef({ angle: 0 });

  useFrame((state) => {
    if (groupRef.current) {
      driftRef.current.angle += 0.0003;
      const a = driftRef.current.angle;
      groupRef.current.position.x = 5.5 + Math.sin(a * 0.7) * 0.3;
      groupRef.current.position.y = 3.2 + Math.cos(a * 0.5) * 0.2;
      groupRef.current.rotation.z = Math.sin(a * 0.3) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[5.5, 3.2, -8]} scale={0.55}>
      <SaturnBody />
      <SaturnRing />
      <SaturnAtmosphere />
    </group>
  );
}
