import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BirthdayWish } from '../types';

interface WishingWellCanvasProps {
  wishes: BirthdayWish[];
  onCanvasReady?: (triggerDrop: () => void, triggerShootingStar: (letter: string) => void) => void;
}

export default function WishingWellCanvas({ wishes, onCanvasReady }: WishingWellCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerDropRef = useRef<(() => void) | null>(null);
  const triggerShootingStarRef = useRef<((letter: string) => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060312, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.6, 6.2);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.6);
    scene.add(ambientLight);

    const wellInnerLight = new THREE.PointLight(0xd946ef, 3.5, 10);
    wellInnerLight.position.set(0, 0.5, 0);
    scene.add(wellInnerLight);

    const skyStarLight = new THREE.PointLight(0xfbbf24, 2.0, 15);
    skyStarLight.position.set(0, 5, 0);
    scene.add(skyStarLight);

    // 1. SKY STARFIELD & BACKGROUND COSMOS
    const starCount = 1800;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const skyPal = [
      new THREE.Color(0xd946ef),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xfbbf24),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 26;
      starPos[i * 3 + 1] = Math.random() * 15 + 1.0;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;

      const col = skyPal[Math.floor(Math.random() * skyPal.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starPoints = new THREE.Points(
      starGeom,
      new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.85 })
    );
    scene.add(starPoints);

    // 2. K - A - J - A - L CONSTELLATION IN THE SKY
    // Define 3D coordinates for K, A, J, A, L
    const constellationGroup = new THREE.Group();
    constellationGroup.position.set(0, 4.2, -4);
    scene.add(constellationGroup);

    interface ConstellationDef {
      letter: string;
      offsetX: number;
      nodes: [number, number][];
      lines: [number, number][];
    }

    const constellations: ConstellationDef[] = [
      // K
      {
        letter: 'K',
        offsetX: -3.4,
        nodes: [
          [0, 1.2],
          [0, 0],
          [0, -1.2],
          [0.8, 1.2],
          [0.8, -1.2],
        ],
        lines: [
          [0, 1],
          [1, 2],
          [1, 3],
          [1, 4],
        ],
      },
      // A
      {
        letter: 'A',
        offsetX: -1.7,
        nodes: [
          [0.4, 1.3],
          [-0.3, -1.2],
          [1.1, -1.2],
          [0.05, -0.2],
          [0.75, -0.2],
        ],
        lines: [
          [0, 1],
          [0, 2],
          [3, 4],
        ],
      },
      // J
      {
        letter: 'J',
        offsetX: 0.1,
        nodes: [
          [-0.5, 1.2],
          [0.5, 1.2],
          [0.5, -0.6],
          [0.2, -1.2],
          [-0.4, -1.0],
        ],
        lines: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ],
      },
      // A (second)
      {
        letter: 'A2',
        offsetX: 1.8,
        nodes: [
          [0.4, 1.3],
          [-0.3, -1.2],
          [1.1, -1.2],
          [0.05, -0.2],
          [0.75, -0.2],
        ],
        lines: [
          [0, 1],
          [0, 2],
          [3, 4],
        ],
      },
      // L
      {
        letter: 'L',
        offsetX: 3.5,
        nodes: [
          [0, 1.2],
          [0, -1.2],
          [0.9, -1.2],
        ],
        lines: [
          [0, 1],
          [1, 2],
        ],
      },
    ];

    const starNodeMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.8,
    });

    const constLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
    });

    const constStarMeshes: THREE.Mesh[] = [];

    constellations.forEach((c) => {
      // Create lines
      c.lines.forEach(([startIdx, endIdx]) => {
        const p1 = c.nodes[startIdx];
        const p2 = c.nodes[endIdx];
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p1[0] + c.offsetX, p1[1], 0),
          new THREE.Vector3(p2[0] + c.offsetX, p2[1], 0),
        ]);
        const lineMesh = new THREE.Line(lineGeom, constLineMat);
        constellationGroup.add(lineMesh);
      });

      // Create glowing nodes
      c.nodes.forEach((pos) => {
        const sMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), starNodeMat);
        sMesh.position.set(pos[0] + c.offsetX, pos[1], 0);
        constellationGroup.add(sMesh);
        constStarMeshes.push(sMesh);
      });
    });

    // 3. THE 3D ENCHANTED WISHING WELL
    const wellGroup = new THREE.Group();
    wellGroup.position.set(0, -0.2, 0);
    scene.add(wellGroup);

    // Stone base outer cylinder
    const wellCylinderGeom = new THREE.CylinderGeometry(1.6, 1.7, 1.3, 24, 2, true);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1f1d2b,
      roughness: 0.85,
      metalness: 0.2,
      flatShading: true,
    });
    const wellOuter = new THREE.Mesh(wellCylinderGeom, stoneMat);
    wellOuter.position.y = 0.65;
    wellGroup.add(wellOuter);

    // Stone Coping Rim on top of well
    const rimGeom = new THREE.TorusGeometry(1.6, 0.18, 12, 28);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x2e1065,
      emissive: 0x1e1b4b,
      roughness: 0.6,
      metalness: 0.4,
    });
    const wellRim = new THREE.Mesh(rimGeom, rimMat);
    wellRim.position.y = 1.3;
    wellRim.rotation.x = Math.PI / 2;
    wellGroup.add(wellRim);

    // Well Roof Timber Arch
    const pillarGeom = new THREE.CylinderGeometry(0.08, 0.09, 2.2, 8);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });

    const leftPillar = new THREE.Mesh(pillarGeom, woodMat);
    leftPillar.position.set(-1.4, 2.2, 0);
    wellGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeom, woodMat);
    rightPillar.position.set(1.4, 2.2, 0);
    wellGroup.add(rightPillar);

    // Crossbar
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 8), woodMat);
    crossbar.position.set(0, 3.2, 0);
    crossbar.rotation.z = Math.PI / 2;
    wellGroup.add(crossbar);

    // Hanging celestial lantern
    const lantern = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.5,
      })
    );
    lantern.position.set(0, 2.6, 0);
    wellGroup.add(lantern);

    // 4. THE SWIRLING GALAXY WATER SURFACE INSIDE THE WELL
    // Incorporating magenta, deep blue, silver/white, and golden amber
    const waterGeom = new THREE.CircleGeometry(1.48, 36);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      emissive: 0x3b0764,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9,
    });
    const waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0.95;
    wellGroup.add(waterMesh);

    // Galaxy Swirl Vortex Particles on water surface
    const vortexCount = 450;
    const vortexGeom = new THREE.BufferGeometry();
    const vortexPos = new Float32Array(vortexCount * 3);
    const vortexColors = new Float32Array(vortexCount * 3);
    const vortexAngles = new Float32Array(vortexCount);
    const vortexRadii = new Float32Array(vortexCount);

    const vortexPal = [
      new THREE.Color(0xd946ef), // Magenta
      new THREE.Color(0x1e40af), // Royal deep blue
      new THREE.Color(0xe0e7ff), // Silver white
      new THREE.Color(0xfbbf24), // Golden amber
    ];

    for (let i = 0; i < vortexCount; i++) {
      vortexRadii[i] = Math.random() * 1.35;
      vortexAngles[i] = Math.random() * Math.PI * 2;

      vortexPos[i * 3] = Math.cos(vortexAngles[i]) * vortexRadii[i];
      vortexPos[i * 3 + 1] = 0.98 + (Math.random() - 0.5) * 0.04;
      vortexPos[i * 3 + 2] = Math.sin(vortexAngles[i]) * vortexRadii[i];

      const col = vortexPal[i % vortexPal.length];
      vortexColors[i * 3] = col.r;
      vortexColors[i * 3 + 1] = col.g;
      vortexColors[i * 3 + 2] = col.b;
    }

    vortexGeom.setAttribute('position', new THREE.BufferAttribute(vortexPos, 3));
    vortexGeom.setAttribute('color', new THREE.BufferAttribute(vortexColors, 3));

    const vortexPoints = new THREE.Points(
      vortexGeom,
      new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      })
    );
    wellGroup.add(vortexPoints);

    // 5. TYPING FALLING GOLDEN PARTICLES POOL
    const maxDropParticles = 120;
    interface DropParticle {
      active: boolean;
      mesh: THREE.Mesh;
      vy: number;
      vx: number;
      vz: number;
    }

    const dropMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const dropGeom = new THREE.SphereGeometry(0.04, 6, 6);
    const dropPool: DropParticle[] = [];

    for (let i = 0; i < maxDropParticles; i++) {
      const dropMesh = new THREE.Mesh(dropGeom, dropMat);
      dropMesh.visible = false;
      scene.add(dropMesh);
      dropPool.push({ active: false, mesh: dropMesh, vy: 0, vx: 0, vz: 0 });
    }

    const spawnTypingParticles = () => {
      for (let k = 0; k < 6; k++) {
        const available = dropPool.find((p) => !p.active);
        if (available) {
          available.active = true;
          available.mesh.visible = true;
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.8;
          available.mesh.position.set(Math.cos(angle) * r, 3.2 + Math.random() * 0.4, Math.sin(angle) * r);
          available.vy = -1.8 - Math.random() * 1.5;
          available.vx = (Math.random() - 0.5) * 0.2;
          available.vz = (Math.random() - 0.5) * 0.2;
        }
      }
    };
    triggerDropRef.current = spawnTypingParticles;

    // 6. ASCENDING 3D SHOOTING STAR (Ascends to Constellation on Submit)
    interface ShootingStar {
      active: boolean;
      head: THREE.Mesh;
      trail: THREE.Points;
      trailGeom: THREE.BufferGeometry;
      trailPos: Float32Array;
      progress: number;
      targetPos: THREE.Vector3;
    }

    const activeShootingStars: ShootingStar[] = [];

    const spawnShootingStar = (targetLetter: string) => {
      const starGeom = new THREE.SphereGeometry(0.12, 12, 12);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfef08a,
        emissiveIntensity: 2.5,
      });
      const head = new THREE.Mesh(starGeom, starMat);
      head.position.set(0, 0.9, 0);
      scene.add(head);

      // Trail
      const trailPointsCount = 40;
      const trailGeom = new THREE.BufferGeometry();
      const trailPos = new Float32Array(trailPointsCount * 3);
      for (let t = 0; t < trailPointsCount; t++) {
        trailPos[t * 3] = 0;
        trailPos[t * 3 + 1] = 0.9;
        trailPos[t * 3 + 2] = 0;
      }
      trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
      const trail = new THREE.Points(
        trailGeom,
        new THREE.PointsMaterial({
          size: 0.1,
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        })
      );
      scene.add(trail);

      // Target random constellation node
      const randomNode = constStarMeshes[Math.floor(Math.random() * constStarMeshes.length)];
      const targetPos = randomNode ? randomNode.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 4.5, -4);

      activeShootingStars.push({
        active: true,
        head,
        trail,
        trailGeom,
        trailPos,
        progress: 0,
        targetPos,
      });
    };
    triggerShootingStarRef.current = spawnShootingStar;

    if (onCanvasReady) {
      onCanvasReady(spawnTypingParticles, spawnShootingStar);
    }

    // ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Swirling galaxy water vortex animation
      const vPosAttr = vortexGeom.attributes.position as THREE.BufferAttribute;
      const curVPos = vPosAttr.array as Float32Array;

      for (let i = 0; i < vortexCount; i++) {
        // Particles rotate faster towards center (differential rotation)
        const speed = 1.2 / (vortexRadii[i] + 0.3);
        vortexAngles[i] += speed * delta;
        curVPos[i * 3] = Math.cos(vortexAngles[i]) * vortexRadii[i];
        curVPos[i * 3 + 2] = Math.sin(vortexAngles[i]) * vortexRadii[i];
      }
      vPosAttr.needsUpdate = true;

      // Constellation stars twinkle
      constStarMeshes.forEach((starMesh, idx) => {
        const scale = 1.0 + Math.sin(elapsed * 4 + idx) * 0.25;
        starMesh.scale.setScalar(scale);
      });

      // Update falling typing particles
      dropPool.forEach((p) => {
        if (p.active) {
          p.mesh.position.y += p.vy * delta;
          p.mesh.position.x += p.vx * delta;
          p.mesh.position.z += p.vz * delta;

          // Hit water surface
          if (p.mesh.position.y <= 0.95) {
            p.active = false;
            p.mesh.visible = false;
          }
        }
      });

      // Update ascending shooting stars
      for (let s = activeShootingStars.length - 1; s >= 0; s--) {
        const star = activeShootingStars[s];
        star.progress += delta * 1.1;

        // Quadratic bezier arc up to constellation
        const t = Math.min(1.0, star.progress);
        const start = new THREE.Vector3(0, 0.9, 0);
        const control = new THREE.Vector3((Math.random() - 0.5) * 2, 3.8, -1.5);
        const end = star.targetPos;

        const currentPos = new THREE.Vector3()
          .copy(start)
          .multiplyScalar((1 - t) * (1 - t))
          .add(new THREE.Vector3().copy(control).multiplyScalar(2 * (1 - t) * t))
          .add(new THREE.Vector3().copy(end).multiplyScalar(t * t));

        star.head.position.copy(currentPos);

        // Update trail
        for (let tr = 39; tr > 0; tr--) {
          star.trailPos[tr * 3] = star.trailPos[(tr - 1) * 3];
          star.trailPos[tr * 3 + 1] = star.trailPos[(tr - 1) * 3 + 1];
          star.trailPos[tr * 3 + 2] = star.trailPos[(tr - 1) * 3 + 2];
        }
        star.trailPos[0] = currentPos.x;
        star.trailPos[1] = currentPos.y;
        star.trailPos[2] = currentPos.z;
        (star.trailGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        if (star.progress >= 1.0) {
          // Explode at apex
          scene.remove(star.head);
          scene.remove(star.trail);
          star.head.geometry.dispose();
          star.trailGeom.dispose();
          activeShootingStars.splice(s, 1);
        }
      }

      // Gentle camera sway
      camera.position.x = Math.sin(elapsed * 0.25) * 0.4;
      camera.position.y = 2.6 + Math.cos(elapsed * 0.3) * 0.15;
      camera.lookAt(0, 1.2, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeom.dispose();
      vortexGeom.dispose();
      dropGeom.dispose();
      dropMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [wishes, onCanvasReady]);

  return (
    <div className="relative w-full h-full min-h-[580px] sm:min-h-[660px] flex items-center justify-center select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Constellation Overlay Label */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h3 className="text-xl sm:text-2xl font-cinzel font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-amber-200 to-indigo-300">
          K • A • J • A • L
        </h3>
        <p className="text-xs font-cormorant italic text-indigo-200/80 tracking-widest mt-1">
          The Celestial Birthday Constellation
        </p>
      </div>

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#060312]/30 to-[#030108]/90" />
    </div>
  );
}
