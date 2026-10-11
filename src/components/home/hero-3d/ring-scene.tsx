"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollVelocity } from "@/lib/motion";

export interface RingItem {
  id: string;
  texture: string;
}

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  uniform float uPhase;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // A soft fabric ripple that gets stronger while the ring is moving.
    p.z += sin(p.y * 3.2 + uTime * 1.6 + uPhase) * (0.025 + uVelocity * 0.22);
    p.z += sin(p.x * 2.4 + uTime * 1.1 + uPhase) * uVelocity * 0.12;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uLoaded;
  varying vec2 vUv;
  void main() {
    vec2 uv = (vUv - 0.5) * (1.0 - uHover * 0.08) + 0.5;
    float shift = uVelocity * 0.02;
    vec3 col;
    col.r = texture2D(uMap, uv + vec2(shift, 0.0)).r;
    col.g = texture2D(uMap, uv).g;
    col.b = texture2D(uMap, uv - vec2(shift, 0.0)).b;
    if (!gl_FrontFacing) col *= 0.22;
    col = mix(vec3(0.06), col, uLoaded);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/** A plane bent onto a cylinder of the given radius (so panels form a ring). */
function bentPlane(width: number, height: number, radius: number) {
  const geometry = new THREE.PlaneGeometry(width, height, 40, 8);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const theta = pos.getX(i) / radius;
    pos.setX(i, Math.sin(theta) * radius);
    pos.setZ(i, Math.cos(theta) * radius - radius);
  }
  geometry.computeVertexNormals();
  return geometry;
}

interface RingProps {
  items: RingItem[];
  intro: boolean;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
}

function Ring({ items, intro, onHover, onSelect }: RingProps) {
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const { gl, size } = useThree();
  const mobile = size.width < 768;
  const radius = mobile ? 3.1 : 4.1;
  const panel = mobile ? { w: 1.15, h: 1.53 } : { w: 1.3, h: 1.73 };
  const motion = useRef({ rot: 0, target: 0, vel: 0, drag: false, lastX: 0, moved: 0, hovered: -1 });

  const geometry = useMemo(() => bentPlane(panel.w, panel.h, radius), [panel.w, panel.h, radius]);

  const materials = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    return items.map((item, i) => {
      const uniforms = {
        uMap: { value: null as THREE.Texture | null },
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uHover: { value: 0 },
        uLoaded: { value: 0 },
        uPhase: { value: i * 0.9 },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        side: THREE.DoubleSide,
      });
      loader.load(item.texture, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        uniforms.uMap.value = texture;
        material.userData.loaded = true;
      });
      return material;
    });
  }, [items]);

  useEffect(
    () => () => {
      geometry.dispose();
      for (const m of materials) {
        (m.uniforms.uMap.value as THREE.Texture | null)?.dispose();
        m.dispose();
      }
    },
    [geometry, materials],
  );

  // Drag to spin (with inertia handled in the frame loop).
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      motion.current.drag = true;
      motion.current.lastX = e.clientX;
      motion.current.moved = 0;
    };
    const move = (e: PointerEvent) => {
      const m = motion.current;
      if (!m.drag) return;
      const dx = e.clientX - m.lastX;
      m.lastX = e.clientX;
      m.moved += Math.abs(dx);
      m.target += dx * 0.006;
      m.vel = Math.min(1, Math.abs(dx) / 40);
    };
    const up = () => (motion.current.drag = false);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const m = motion.current;
    const t = state.clock.elapsedTime;
    if (!m.drag) m.target += delta * 0.14;
    m.rot = THREE.MathUtils.damp(m.rot, m.target, 4, delta);

    const scroll = typeof window === "undefined" ? 0 : window.scrollY;
    if (spin.current) spin.current.rotation.y = m.rot + scroll * 0.0016;

    const velocity = Math.min(1, Math.abs(scrollVelocity()) / 40 + m.vel);
    m.vel = THREE.MathUtils.damp(m.vel, 0, 3, delta);

    if (tilt.current) {
      const s = THREE.MathUtils.damp(tilt.current.scale.x, intro ? 1 : 0.55, 2.2, delta);
      tilt.current.scale.setScalar(s);
      tilt.current.rotation.z = THREE.MathUtils.damp(tilt.current.rotation.z, intro ? -0.07 : -0.6, 2, delta);
    }

    // Subtle parallax: the camera drifts toward the pointer.
    const { camera, pointer } = state;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.7, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.9 + pointer.y * 0.45, 2.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, mobile ? 13.5 : 12, 2, delta);
    camera.lookAt(0, -0.2, 0);

    materials.forEach((mat, i) => {
      const u = mat.uniforms;
      u.uTime.value = t;
      u.uVelocity.value = THREE.MathUtils.damp(u.uVelocity.value, velocity, 6, delta);
      u.uHover.value = THREE.MathUtils.damp(u.uHover.value, m.hovered === i ? 1 : 0, 8, delta);
      if (mat.userData.loaded) u.uLoaded.value = THREE.MathUtils.damp(u.uLoaded.value, 1, 3, delta);
    });
  });

  const world = useMemo(() => new THREE.Vector3(), []);
  const isFront = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.object.getWorldPosition(world).z > 0.4;

  return (
    <group ref={tilt} rotation={[0.1, 0, -0.6]} position={[0, mobile ? 0.9 : 0.55, 0]} scale={0.55}>
      <group ref={spin}>
        {items.map((item, i) => {
          const angle = (i / items.length) * Math.PI * 2;
          return (
            <group key={item.id} rotation={[0, angle, 0]}>
              <mesh
                geometry={geometry}
                material={materials[i]}
                position={[0, 0, radius]}
                onPointerOver={(e) => {
                  if (!isFront(e)) return;
                  e.stopPropagation();
                  motion.current.hovered = i;
                  onHover(i);
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  if (motion.current.hovered === i) motion.current.hovered = -1;
                  onHover(null);
                  document.body.style.cursor = "";
                }}
                onClick={(e) => {
                  if (!isFront(e) || motion.current.moved > 6) return;
                  e.stopPropagation();
                  document.body.style.cursor = "";
                  onSelect(i);
                }}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}

export default function RingScene(props: RingProps & { active: boolean }) {
  const { active, ...ring } = props;
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.9, 12], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <Ring {...ring} />
    </Canvas>
  );
}
