'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Token strings that the image "reforms" into
const TOKEN_STRINGS = ['isometric', '#7C5CFF', 'soft shadow', '32mm lens'] as const;

// 3D positions for the token label cloud (spread around center-right)
const TOKEN_POSITIONS: [number, number, number][] = [
  [-1.4,  0.9, 0.3],
  [ 0.3,  0.6, 0.4],
  [-0.7, -0.3, 0.2],
  [ 1.1, -0.7, 0.1],
];

// ---------------------------------------------------------------------------
// Dissolve plane shader
// ---------------------------------------------------------------------------
const DISSOLVE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DISSOLVE_FRAG = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uDissolve;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p * 6.0);
    vec2 f = fract(p * 6.0);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    float n = noise(vUv);
    float edge = 0.04;
    float alpha = smoothstep(uDissolve - edge, uDissolve + edge, 1.0 - n);
    // Purple edge glow during transition
    float glowT = smoothstep(uDissolve + edge, uDissolve, 1.0 - n)
                * smoothstep(uDissolve - edge * 2.5, uDissolve - edge, 1.0 - n);
    vec3 glowCol = vec3(0.486, 0.361, 1.0); // #7C5CFF
    vec3 finalCol = mix(color.rgb, glowCol, clamp(glowT * 0.8, 0.0, 1.0));
    gl_FragColor = vec4(finalCol, color.a * alpha);
  }
`;

// ---------------------------------------------------------------------------
// Particle shader
// ---------------------------------------------------------------------------
const PARTICLE_VERT = /* glsl */ `
  attribute vec3 aScatter;
  attribute vec3 aTarget;
  uniform float uDissolve;
  uniform float uReform;
  varying float vOpacity;
  varying float vReform;

  void main() {
    vec3 pos = mix(position, aScatter, uDissolve);
    pos = mix(pos, aTarget, uReform);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float size = mix(2.5, 4.0, uDissolve) * mix(1.0, 0.6, uReform);
    gl_PointSize = size * (350.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vOpacity = clamp(uDissolve * 3.0 - 0.5, 0.0, 1.0) * (0.4 + uReform * 0.6);
    vReform = uReform;
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  varying float vOpacity;
  varying float vReform;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.1, d) * vOpacity;
    // Interpolate purple → cyan as reform progresses
    vec3 col = mix(vec3(0.486, 0.361, 1.0), vec3(0.0, 0.882, 1.0), vReform);
    gl_FragColor = vec4(col, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Procedural screenshot placeholder texture (dark-mode UI mockup)
// ---------------------------------------------------------------------------
function buildScreenshotTexture(): THREE.DataTexture {
  const w = 256, h = 192;
  const data = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      const isTopBar  = y < 22;
      const isSidebar = x < 44;
      const r0 = isTopBar ? 22 : isSidebar ? 16 : 10;
      const g0 = isTopBar ? 22 : isSidebar ? 16 : 10;
      const b0 = isTopBar ? 32 : isSidebar ? 22 : 16;

      // Content blocks for visual interest
      const bx = Math.floor((x - 44) / 56);
      const by = Math.floor((y - 22) / 30);
      const isBlock = !isTopBar && !isSidebar && (bx + by) % 3 === 0;
      const isAccent = !isTopBar && !isSidebar && bx === 1 && by < 3;

      data[idx]     = isAccent ? 80  : isBlock ? Math.min(255, r0 + 35) : r0;
      data[idx + 1] = isAccent ? 50  : isBlock ? Math.min(255, g0 + 15) : g0;
      data[idx + 2] = isAccent ? 180 : isBlock ? Math.min(255, b0 + 70) : b0;
      data[idx + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

// ---------------------------------------------------------------------------
// Scene content (must be inside <Canvas>)
// ---------------------------------------------------------------------------
interface SceneContentProps {
  scrollProgress: React.MutableRefObject<number>;
}

function SceneContent({ scrollProgress }: SceneContentProps) {
  const { camera } = useThree();

  const planeMatRef   = useRef<THREE.ShaderMaterial>(null);
  const particleMatRef = useRef<THREE.ShaderMaterial>(null);
  const tokenDivRefs  = useRef<(HTMLDivElement | null)[]>([]);

  // Build screenshot texture once
  const texture = useMemo(() => buildScreenshotTexture(), []);

  // Build particle geometry once
  const particleGeo = useMemo(() => {
    const count = 2800;
    const positions = new Float32Array(count * 3);
    const scatter   = new Float32Array(count * 3);
    const targets   = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Origin: random point on the 4×3 plane
      positions[i * 3]     = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = 0;

      // Scatter: bloom outward into a loose 3-D cloud
      scatter[i * 3]     = (Math.random() - 0.5) * 7;
      scatter[i * 3 + 1] = (Math.random() - 0.5) * 5;
      scatter[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5;

      // Target: cluster around one of the token positions
      const t = Math.floor(Math.random() * TOKEN_POSITIONS.length);
      targets[i * 3]     = TOKEN_POSITIONS[t][0] + (Math.random() - 0.5) * 0.5;
      targets[i * 3 + 1] = TOKEN_POSITIONS[t][1] + (Math.random() - 0.5) * 0.35;
      targets[i * 3 + 2] = TOKEN_POSITIONS[t][2] + (Math.random() - 0.5) * 0.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScatter', new THREE.BufferAttribute(scatter,   3));
    geo.setAttribute('aTarget',  new THREE.BufferAttribute(targets,   3));
    return geo;
  }, []);

  useFrame(() => {
    const p = scrollProgress.current;

    // Camera dolly in: 0% → 33%
    const dolly = Math.max(0, Math.min(1, p / 0.33));
    (camera as THREE.PerspectiveCamera).position.z = 6 - dolly * 1.2;

    // Dissolve: 33% → 66%
    const dissolve = Math.max(0, Math.min(1, (p - 0.33) / 0.33));
    // Reform: 66% → 100%
    const reform   = Math.max(0, Math.min(1, (p - 0.66) / 0.34));

    if (planeMatRef.current) {
      (planeMatRef.current.uniforms['uDissolve'] as THREE.IUniform<number>).value = dissolve;
    }
    if (particleMatRef.current) {
      (particleMatRef.current.uniforms['uDissolve'] as THREE.IUniform<number>).value = dissolve;
      (particleMatRef.current.uniforms['uReform']   as THREE.IUniform<number>).value = reform;
    }

    // Stagger token labels in as reform progresses
    tokenDivRefs.current.forEach((div, i) => {
      if (!div) return;
      const delay = i * 0.14;
      const localT = Math.max(0, Math.min(1, (reform - delay) / (1 - Math.min(delay, 0.9))));
      div.style.opacity = String(localT);
      div.style.transform = `scale(${0.6 + localT * 0.4}) translateY(${(1 - localT) * 8}px)`;
    });
  });

  return (
    <>
      {/* Screenshot plane with dissolve shader */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4, 3]} />
        <shaderMaterial
          ref={planeMatRef}
          vertexShader={DISSOLVE_VERT}
          fragmentShader={DISSOLVE_FRAG}
          uniforms={{
            uTexture:  { value: texture },
            uDissolve: { value: 0 },
          }}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Particle cloud */}
      <points geometry={particleGeo}>
        <shaderMaterial
          ref={particleMatRef}
          vertexShader={PARTICLE_VERT}
          fragmentShader={PARTICLE_FRAG}
          uniforms={{
            uDissolve: { value: 0 },
            uReform:   { value: 0 },
          }}
          transparent
          depthWrite={false}
        />
      </points>

      {/* Token labels — HTML overlaid via drei Html portal */}
      {TOKEN_STRINGS.map((token, i) => (
        <Html
          key={token}
          position={TOKEN_POSITIONS[i]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            ref={(el) => { tokenDivRefs.current[i] = el; }}
            style={{
              fontFamily: 'JetBrains Mono, SF Mono, Menlo, monospace',
              fontSize: 13,
              fontWeight: 500,
              color: '#7c5cff',
              background: 'rgba(124, 92, 255, 0.12)',
              border: '1px solid rgba(124, 92, 255, 0.35)',
              borderRadius: 4,
              padding: '2px 10px',
              whiteSpace: 'nowrap',
              opacity: 0,
              transform: 'scale(0.6) translateY(8px)',
              transition: 'none',
              userSelect: 'none',
            }}
          >
            {token}
          </div>
        </Html>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Public export — full R3F Canvas
// ---------------------------------------------------------------------------
export interface HowItWorksSceneProps {
  scrollProgress: React.MutableRefObject<number>;
}

export default function HowItWorksScene({ scrollProgress }: HowItWorksSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneContent scrollProgress={scrollProgress} />
    </Canvas>
  );
}
