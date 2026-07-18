"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function EarthSurface() {
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
          for (int i = 0; i < 6; i++) {
            v += a * noise(p);
            p = p * 2.0 + vec3(100.0);
            a *= 0.5;
          }
          return v;
        }

        float continentMask(vec2 uv) {
          float lat = uv.y;
          float lon = uv.x;
          float c = 0.0;
          c += fbm(vec3(lon * 4.0, lat * 3.0, 1.0)) * 0.6;
          c += fbm(vec3(lon * 8.0 + 5.0, lat * 6.0 + 3.0, 2.0)) * 0.3;
          c += fbm(vec3(lon * 16.0 + 10.0, lat * 12.0 + 7.0, 3.0)) * 0.1;
          float polarIce = smoothstep(0.12, 0.0, lat) + smoothstep(0.88, 1.0, lat);
          c = mix(c, 1.0, polarIce * 0.8);
          return clamp(c, 0.0, 1.0);
        }

        void main() {
          vec2 uv = vUv;
          float lon = uv.x;
          float lat = uv.y;

          float land = continentMask(uv);

          vec3 deepOcean = vec3(0.01, 0.05, 0.18);
          vec3 shallowOcean = vec3(0.02, 0.12, 0.28);
          vec3 oceanHighlight = vec3(0.04, 0.18, 0.35);

          float oceanDepth = fbm(vec3(lon * 12.0, lat * 10.0, 5.0));
          vec3 oceanColor = mix(deepOcean, shallowOcean, oceanDepth * 0.6);
          oceanColor = mix(oceanColor, oceanHighlight, pow(oceanDepth, 3.0) * 0.3);

          float wavePattern = sin(lon * 80.0 + time * 0.3) * sin(lat * 60.0 - time * 0.2);
          oceanColor += wavePattern * 0.008;

          vec3 desert = vec3(0.72, 0.62, 0.42);
          vec3 grassland = vec3(0.18, 0.38, 0.12);
          vec3 forest = vec3(0.08, 0.25, 0.06);
          vec3 mountain = vec3(0.35, 0.30, 0.22);
          vec3 snow = vec3(0.92, 0.95, 0.98);
          vec3 tropicalGreen = vec3(0.12, 0.35, 0.08);

          float detail = fbm(vec3(lon * 20.0, lat * 18.0, 8.0));
          float elevation = fbm(vec3(lon * 6.0, lat * 5.0, 4.0));

          vec3 landColor = mix(grassland, forest, smoothstep(0.3, 0.6, detail));
          landColor = mix(landColor, tropicalGreen, smoothstep(0.5, 0.7, elevation) * 0.5);
          landColor = mix(landColor, desert, smoothstep(0.6, 0.8, elevation) * 0.6);
          landColor = mix(landColor, mountain, smoothstep(0.7, 0.9, elevation) * 0.7);

          float mountainPeaks = fbm(vec3(lon * 30.0, lat * 25.0, 12.0));
          landColor = mix(landColor, snow, smoothstep(0.82, 0.95, mountainPeaks) * 0.8);

          float polarIce2 = smoothstep(0.1, 0.0, lat) + smoothstep(0.9, 1.0, lat);
          landColor = mix(landColor, snow, polarIce2 * 0.9);

          vec3 surfaceColor = mix(oceanColor, landColor, land);

          vec3 lightDir = normalize(vec3(1.0, 0.3, 1.0));
          float diffuse = max(dot(vNormal, lightDir), 0.0);
          diffuse = diffuse * 0.55 + 0.45;

          float specular = pow(max(dot(reflect(-lightDir, vNormal), normalize(-vWorldPos)), 0.0), 32.0);
          float oceanSpec = specular * (1.0 - land) * 0.4;
          surfaceColor += vec3(oceanSpec);

          float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);

          surfaceColor *= diffuse;
          surfaceColor += fresnel * vec3(0.15, 0.3, 0.6) * 0.3;

          gl_FragColor = vec4(surfaceColor, 1.0);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[2.0, 128, 64]} />
    </mesh>
  );
}

function EarthClouds() {
  const meshRef = useRef<THREE.Mesh>(null!);

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
          vec2 uv = vUv;
          float cloud = fbm(vec3(uv.x * 6.0 + time * 0.015, uv.y * 5.0, 0.0));
          cloud = smoothstep(0.35, 0.7, cloud);

          float density = fbm(vec3(uv.x * 12.0 + time * 0.02, uv.y * 10.0, 5.0));
          cloud *= mix(0.6, 1.0, density);

          float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
          float alpha = cloud * 0.55 * (1.0 - fresnel * 0.3);

          vec3 lightDir = normalize(vec3(1.0, 0.3, 1.0));
          float lighting = max(dot(vNormal, lightDir), 0.0) * 0.4 + 0.6;

          gl_FragColor = vec4(vec3(lighting), alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0014;
    }
  });

  return (
    <mesh ref={meshRef} material={material} scale={1.012}>
      <sphereGeometry args={[2.0, 64, 32]} />
    </mesh>
  );
}

function EarthAtmosphere() {
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
          float rim = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);
          vec3 innerColor = vec3(0.3, 0.6, 1.0);
          vec3 outerColor = vec3(0.1, 0.3, 0.8);
          vec3 color = mix(innerColor, outerColor, rim);
          float alpha = rim * 0.5;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh material={material} scale={1.06}>
      <sphereGeometry args={[2.0, 64, 32]} />
    </mesh>
  );
}

function EarthNightSide() {
  const meshRef = useRef<THREE.Mesh>(null!);

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

        void main() {
          vec3 lightDir = normalize(vec3(1.0, 0.3, 1.0));
          float daySide = max(dot(vNormal, lightDir), 0.0);

          float cities = noise(vec3(vUv.x * 80.0, vUv.y * 60.0, 1.0));
          cities = smoothstep(0.72, 0.78, cities);

          float grid = noise(vec3(vUv.x * 200.0, vUv.y * 150.0, 2.0));
          grid = smoothstep(0.85, 0.9, grid);

          vec3 cityColor = vec3(1.0, 0.85, 0.5);
          vec3 lightColor = cityColor * (cities * 0.6 + grid * 0.3);

          float flicker = 0.95 + 0.05 * sin(time * 3.0 + cities * 20.0);
          lightColor *= flicker;

          float alpha = (1.0 - daySide) * cities * 0.8;

          gl_FragColor = vec4(lightColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[2.005, 64, 32]} />
    </mesh>
  );
}

export default function Earth() {
  const groupRef = useRef<THREE.Group>(null!);
  const driftRef = useRef({ angle: 0 });

  useFrame(() => {
    if (groupRef.current) {
      driftRef.current.angle += 0.00025;
      const a = driftRef.current.angle;
      groupRef.current.position.x = -5.0 + Math.sin(a * 0.6) * 0.4;
      groupRef.current.position.y = 1.5 + Math.cos(a * 0.4) * 0.3;
      groupRef.current.rotation.z = Math.sin(a * 0.2) * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={[-5.0, 1.5, -9]} scale={0.5}>
      <EarthSurface />
      <EarthClouds />
      <EarthNightSide />
      <EarthAtmosphere />
    </group>
  );
}
