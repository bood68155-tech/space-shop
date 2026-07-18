"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function SaturnBody() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
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
            mix(mix(hash(vec2(n, 0.0)), hash(vec2(n + 1.0, 0.0)), f.x),
                mix(hash(vec2(n + 157.0, 0.0)), hash(vec2(n + 158.0, 0.0)), f.x), f.y),
            mix(mix(hash(vec2(n + 113.0, 0.0)), hash(vec2(n + 114.0, 0.0)), f.x),
                mix(hash(vec2(n + 270.0, 0.0)), hash(vec2(n + 271.0, 0.0)), f.x), f.y),
            f.z
          );
        }

        float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p = p * 2.0 + vec3(100.0);
            a *= 0.5;
          }
          return v;
        }

        void main() {
          float lat = vUv.y;
          float lon = vUv.x;

          vec3 paleGold = vec3(0.84, 0.77, 0.58);
          vec3 warmBeige = vec3(0.80, 0.70, 0.50);
          vec3 amber = vec3(0.74, 0.60, 0.38);
          vec3 lightCream = vec3(0.90, 0.84, 0.68);
          vec3 darkBand = vec3(0.58, 0.48, 0.30);
          vec3 stormOrange = vec3(0.82, 0.55, 0.28);

          float fineBands = sin(lat * 55.0) * 0.5 + 0.5;
          fineBands = smoothstep(0.3, 0.7, fineBands);

          float largeBands = sin(lat * 14.0 + 0.5) * 0.5 + 0.5;
          float mediumBands = sin(lat * 28.0 + 1.2) * 0.5 + 0.5;

          float detail = fbm(vec3(lon * 25.0, lat * 35.0, time * 0.015));
          float turbulence = fbm(vec3(lon * 10.0, lat * 18.0, 3.0)) * 0.12;
          float swirl = fbm(vec3(lon * 6.0 + time * 0.008, lat * 8.0, 7.0)) * 0.08;

          vec3 baseColor = mix(paleGold, warmBeige, largeBands);
          baseColor = mix(baseColor, amber, fineBands * 0.3);
          baseColor = mix(baseColor, lightCream, detail * 0.2);
          baseColor = mix(baseColor, darkBand, smoothstep(0.6, 0.8, largeBands) * 0.4);
          baseColor = mix(baseColor, warmBeige, mediumBands * 0.15);

          float stormBelt = smoothstep(0.44, 0.5, lat) * smoothstep(0.56, 0.5, lat);
          baseColor = mix(baseColor, stormOrange * 0.85, stormBelt * 0.55);

          float equatorialBulge = smoothstep(0.4, 0.5, lat) * smoothstep(0.6, 0.5, lat);
          baseColor = mix(baseColor, lightCream * 1.1, equatorialBulge * 0.2);

          baseColor += turbulence * vec3(0.04, 0.02, -0.01);
          baseColor += swirl * vec3(0.03, 0.01, -0.02);

          float polarDark = smoothstep(0.82, 1.0, lat) + smoothstep(0.18, 0.0, lat);
          baseColor = mix(baseColor, vec3(0.42, 0.38, 0.28), polarDark * 0.6);

          float hexPolar = smoothstep(0.92, 1.0, lat);
          float hexPattern = sin(lon * 6.2832 * 6.0) * 0.5 + 0.5;
          hexPattern *= hexPolar;
          baseColor = mix(baseColor, vec3(0.55, 0.50, 0.38), hexPattern * 0.3);

          float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
          baseColor += fresnel * vec3(0.18, 0.14, 0.08);

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
      meshRef.current.rotation.y += 0.0018;
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[1.6, 128, 64]} />
    </mesh>
  );
}

function SaturnRing() {
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

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 centeredUv = vUv - 0.5;
          float dist = length(centeredUv) * 2.0;
          float angle = atan(centeredUv.y, centeredUv.x);

          float innerEdge = smoothstep(0.42, 0.44, dist);
          float outerEdge = smoothstep(0.98, 0.95, dist);
          float mask = innerEdge * outerEdge;

          float cassini = 1.0 - smoothstep(0.0, 0.015, abs(dist - 0.68));
          float enckeGap = 1.0 - smoothstep(0.0, 0.008, abs(dist - 0.88));
          float huygensGap = 1.0 - smoothstep(0.0, 0.01, abs(dist - 0.55));
          float dRing = smoothstep(0.42, 0.44, dist) * (1.0 - smoothstep(0.48, 0.50, dist));

          float ringPattern = 0.0;
          ringPattern += sin(dist * 90.0) * 0.25;
          ringPattern += sin(dist * 50.0 + 1.5) * 0.2;
          ringPattern += sin(dist * 140.0 - 0.8) * 0.12;
          ringPattern += noise(vec2(dist * 70.0, angle * 3.0)) * 0.25;
          ringPattern += fbm(vec2(dist * 30.0, angle * 8.0)) * 0.18;
          ringPattern = ringPattern * 0.5 + 0.5;

          float azimuthalPattern = sin(angle * 12.0 + dist * 15.0) * 0.1;
          ringPattern += azimuthalPattern;

          vec3 brightRing = vec3(0.85, 0.78, 0.65);
          vec3 midRing = vec3(0.74, 0.67, 0.52);
          vec3 darkRing = vec3(0.52, 0.46, 0.34);
          vec3 iceRing = vec3(0.90, 0.87, 0.80);
          vec3 dustyRing = vec3(0.65, 0.58, 0.44);
          vec3 dRingColor = vec3(0.45, 0.40, 0.32);

          vec3 ringColor;
          if (dist < 0.48) {
            ringColor = mix(dRingColor, dustyRing, ringPattern);
          } else if (dist < 0.55) {
            ringColor = mix(dustyRing, brightRing, ringPattern);
          } else if (dist < 0.68) {
            ringColor = mix(midRing, brightRing, ringPattern);
          } else if (dist < 0.88) {
            ringColor = mix(darkRing, midRing, ringPattern);
          } else {
            ringColor = mix(midRing, iceRing, ringPattern);
          }

          float density = mask * (1.0 - cassini) * (1.0 - enckeGap) * (1.0 - huygensGap);
          density *= (0.7 + ringPattern * 0.3);

          density *= (0.95 + dRing * 0.05);

          float shimmer = sin(angle * 4.0 + dist * 25.0 + time * 0.25) * 0.04;
          density += shimmer;

          float lightAngle = dot(vNormal, normalize(vec3(1.0, 0.5, 1.0)));
          float lighting = lightAngle * 0.3 + 0.7;

          float backface = dot(vNormal, normalize(vec3(0.0, 0.0, 1.0)));
          float sideFade = smoothstep(-0.3, 0.3, backface);

          gl_FragColor = vec4(ringColor * lighting, density * 0.85 * sideFade);
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
    <mesh material={material} rotation={[Math.PI * 0.42, 0, 0]}>
      <ringGeometry args={[1.9, 4.2, 256]} />
    </mesh>
  );
}

function SaturnAtmosphere() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {},
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
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float intensity = pow(0.6 - max(dot(vNormal, viewDir), 0.0), 4.0);
          vec3 color = mix(vec3(0.88, 0.80, 0.58), vec3(0.92, 0.84, 0.62), intensity);
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

  useFrame(() => {
    if (groupRef.current) {
      driftRef.current.angle += 0.00025;
      const a = driftRef.current.angle;
      groupRef.current.position.x = 5.5 + Math.sin(a * 0.5) * 0.35;
      groupRef.current.position.y = 2.8 + Math.cos(a * 0.35) * 0.25;
      groupRef.current.rotation.z = Math.sin(a * 0.25) * 0.018;
    }
  });

  return (
    <group ref={groupRef} position={[5.5, 2.8, -9]} scale={0.45}>
      <SaturnBody />
      <SaturnRing />
      <SaturnAtmosphere />
    </group>
  );
}
