import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PortraitItem } from '../types';
import { celestialAudio } from '../utils/audio';

interface GardenCanvasProps {
  portraits: PortraitItem[];
  selectedPortraitId: string | null;
  onSelectPortrait: (portrait: PortraitItem) => void;
  isGreyscaleActive: boolean;
  onToggleGreyscale: () => void;
  isBloomActive: boolean;
  onToggleBloom: () => void;
}

export default function GardenCanvas({
  portraits,
  selectedPortraitId,
  onSelectPortrait,
  isGreyscaleActive,
  onToggleGreyscale,
  isBloomActive,
  onToggleBloom,
}: GardenCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePanelIdx, setActivePanelIdx] = useState<number>(0);

  // Garden portraits to place on the path
  const gardenPortraits = portraits.filter(
    (p) => p.section === 'garden' || p.id === 'image_4' || p.id === 'image_6'
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const normalFogColor = new THREE.Color(0x28170d);
    const greyFogColor = new THREE.Color(0x18181b);
    scene.fog = new THREE.FogExp2(isGreyscaleActive ? greyFogColor : normalFogColor, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Sun / Golden hour lighting
    const warmSun = new THREE.DirectionalLight(0xf59e0b, 3.2);
    warmSun.position.set(5, 6, 4);
    scene.add(warmSun);

    const warmAmbient = new THREE.AmbientLight(0x78350f, 1.8);
    scene.add(warmAmbient);

    const softFill = new THREE.PointLight(0xfde047, 2.0, 25);
    softFill.position.set(-4, 3, 2);
    scene.add(softFill);

    // 1. CIRCULAR 3D PATH EMBEDDED WITH GLOWING MEHNDI PATTERNS
    const pathGroup = new THREE.Group();
    scene.add(pathGroup);

    // Ground disk
    const groundGeom = new THREE.CircleGeometry(8, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.8,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -1.2;
    pathGroup.add(groundMesh);

    // Circular Winding Path with flagstone segments
    const pathRadius = 3.6;
    const stoneCount = 36;
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.7,
      metalness: 0.3,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: 0x78350f,
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.4,
    });

    for (let i = 0; i < stoneCount; i++) {
      const angle = (i / stoneCount) * Math.PI * 2;
      const stoneGeom = new THREE.BoxGeometry(0.5, 0.08, 0.7);
      const stone = new THREE.Mesh(stoneGeom, i % 2 === 0 ? stoneMat : pathMat);
      stone.position.set(Math.cos(angle) * pathRadius, -1.16, Math.sin(angle) * pathRadius);
      stone.rotation.y = -angle;
      pathGroup.add(stone);
    }

    // Glowing Mehndi / Mandala floor ring
    const mehndiRingGeom = new THREE.RingGeometry(pathRadius - 0.5, pathRadius + 0.5, 48);
    const mehndiRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const mehndiRing = new THREE.Mesh(mehndiRingGeom, mehndiRingMat);
    mehndiRing.rotation.x = -Math.PI / 2;
    mehndiRing.position.y = -1.14;
    pathGroup.add(mehndiRing);

    // 2. 3D TREES: CYCAD PALM & GRAND GARDEN TREE
    const treesGroup = new THREE.Group();
    scene.add(treesGroup);

    // Cycad Palm (Left side)
    const cycadGroup = new THREE.Group();
    cycadGroup.position.set(-4.5, -1.2, -1.5);

    // Sculpted textured trunk
    const cycadTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.42, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 })
    );
    cycadTrunk.position.y = 1.1;
    cycadGroup.add(cycadTrunk);

    // Arching Cycad Palm fronds
    const frondCount = 14;
    const frondMeshes: THREE.Mesh[] = [];
    for (let f = 0; f < frondCount; f++) {
      const fAngle = (f / frondCount) * Math.PI * 2;
      const frondGeom = new THREE.ConeGeometry(0.18, 2.2, 4);
      const frondMat = new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.5,
      });
      const frond = new THREE.Mesh(frondGeom, frondMat);
      frond.position.set(0, 2.2, 0);
      frond.rotation.z = Math.PI / 3;
      frond.rotation.y = fAngle;
      cycadGroup.add(frond);
      frondMeshes.push(frond);
    }
    treesGroup.add(cycadGroup);

    // Grand Garden Tree (Right side)
    const grandTreeGroup = new THREE.Group();
    grandTreeGroup.position.set(4.5, -1.2, -1.2);

    const banyanTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.7, 3.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.85 })
    );
    banyanTrunk.position.y = 1.6;
    grandTreeGroup.add(banyanTrunk);

    // Layered lush canopy spheres
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.6,
    });
    const canopyOffsets = [
      [0, 3.2, 0, 1.4],
      [-0.8, 2.8, 0.5, 1.1],
      [0.9, 2.9, -0.4, 1.2],
      [0.2, 3.8, 0.1, 1.0],
    ];
    canopyOffsets.forEach(([cx, cy, cz, cr]) => {
      const cMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 1), canopyMat);
      cMesh.position.set(cx, cy, cz);
      grandTreeGroup.add(cMesh);
    });
    treesGroup.add(grandTreeGroup);

    // 3. SPECIAL TRIGGER 1: 3D TERRACOTTA POTTED PLANT WITH BLOOMING FLOWERS
    const potGroup = new THREE.Group();
    potGroup.position.set(-2.0, -1.15, 2.4);
    scene.add(potGroup);

    // Terracotta pot
    const potMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.7 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.65, 16), potMat);
    pot.position.y = 0.32;
    potGroup.add(pot);

    // Pot rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 8, 16), potMat);
    rim.position.y = 0.65;
    rim.rotation.x = Math.PI / 2;
    potGroup.add(rim);

    // Blooming flowers container
    const flowerBloomsGroup = new THREE.Group();
    flowerBloomsGroup.position.y = 0.65;
    potGroup.add(flowerBloomsGroup);

    const flowerColors = [0xf43f5e, 0xfbbf24, 0xf472b6, 0xffedd5, 0xa855f7];
    const flowerMeshes: THREE.Mesh[] = [];

    for (let fl = 0; fl < 9; fl++) {
      const flGeom = new THREE.DodecahedronGeometry(0.12, 0);
      const flMat = new THREE.MeshStandardMaterial({
        color: flowerColors[fl % flowerColors.length],
        emissive: flowerColors[fl % flowerColors.length],
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const flMesh = new THREE.Mesh(flGeom, flMat);
      const angle = (fl / 9) * Math.PI * 2;
      const dist = 0.15 + (fl % 3) * 0.08;
      flMesh.position.set(Math.cos(angle) * dist, 0.1 + (fl % 3) * 0.12, Math.sin(angle) * dist);
      flMesh.scale.setScalar(0.01); // starts closed or scaled
      flowerBloomsGroup.add(flMesh);
      flowerMeshes.push(flMesh);
    }

    // 4. SPECIAL TRIGGER 2: SLOW-MOTION FALLING AUTUMN LEAVES
    const leafCount = 180;
    const leafGeom = new THREE.BufferGeometry();
    const leafPositions = new Float32Array(leafCount * 3);
    const leafRotations = new Float32Array(leafCount * 3);
    const leafSpeeds = new Float32Array(leafCount);
    const leafColors = new Float32Array(leafCount * 3);

    const autumnColors = [
      new THREE.Color(0xd97706), // Amber
      new THREE.Color(0xb91c1c), // Crimson
      new THREE.Color(0xf59e0b), // Golden yellow
      new THREE.Color(0x9a3412), // Russet
    ];

    for (let i = 0; i < leafCount; i++) {
      leafPositions[i * 3] = (Math.random() - 0.5) * 12;
      leafPositions[i * 3 + 1] = Math.random() * 8 + 1;
      leafPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      leafRotations[i * 3] = Math.random() * Math.PI;
      leafRotations[i * 3 + 1] = Math.random() * Math.PI;
      leafRotations[i * 3 + 2] = Math.random() * Math.PI;

      leafSpeeds[i] = 0.3 + Math.random() * 0.6;

      const col = autumnColors[Math.floor(Math.random() * autumnColors.length)];
      leafColors[i * 3] = col.r;
      leafColors[i * 3 + 1] = col.g;
      leafColors[i * 3 + 2] = col.b;
    }

    leafGeom.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3));
    leafGeom.setAttribute('color', new THREE.BufferAttribute(leafColors, 3));

    const leafMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.0, // active in greyscale
    });
    const leafParticles = new THREE.Points(leafGeom, leafMat);
    scene.add(leafParticles);

    // 5. 3D ANIMATED PORTRAIT PANELS ON CIRCULAR PATH
    const panelsGroup = new THREE.Group();
    scene.add(panelsGroup);

    const textureLoader = new THREE.TextureLoader();
    const panelMeshes: { group: THREE.Group; imgMesh: THREE.Mesh; id: string; baseAngle: number }[] = [];

    const displayPortraits = gardenPortraits.slice(0, 6);
    displayPortraits.forEach((p, idx) => {
      const angle = (idx / displayPortraits.length) * Math.PI * 2;
      const pGroup = new THREE.Group();

      const pX = Math.cos(angle) * pathRadius;
      const pZ = Math.sin(angle) * pathRadius;
      pGroup.position.set(pX, 0.4, pZ);
      pGroup.rotation.y = -angle + Math.PI / 2;

      // Rustic ornate wooden frame with gold trim
      const frameGeom = new THREE.BoxGeometry(1.4, 1.9, 0.06);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.6,
        metalness: 0.4,
      });
      const frame = new THREE.Mesh(frameGeom, frameMat);
      pGroup.add(frame);

      // Saree Fabric Plane with segmented vertices for gentle wind breeze ripple
      const imgTex = textureLoader.load(p.src);
      const planeGeom = new THREE.PlaneGeometry(1.3, 1.8, 12, 12);
      const planeMat = new THREE.MeshStandardMaterial({
        map: imgTex,
        roughness: 0.35,
        metalness: 0.1,
      });
      const imgMesh = new THREE.Mesh(planeGeom, planeMat);
      imgMesh.position.z = 0.035;
      pGroup.add(imgMesh);

      // Gold filigree corner accents
      const cornerGeom = new THREE.SphereGeometry(0.04, 8, 8);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });
      [
        [-0.68, 0.92],
        [0.68, 0.92],
        [-0.68, -0.92],
        [0.68, -0.92],
      ].forEach(([cx, cy]) => {
        const cBall = new THREE.Mesh(cornerGeom, goldMat);
        cBall.position.set(cx, cy, 0.05);
        pGroup.add(cBall);
      });

      panelsGroup.add(pGroup);
      panelMeshes.push({ group: pGroup, imgMesh, id: p.id, baseAngle: angle });
    });

    // Camera target smooth transition
    let targetCamX = 0;
    let targetCamY = 2.0;
    let targetCamZ = 7.2;
    let targetLookX = 0;
    let targetLookY = 0.2;
    let targetLookZ = 0;

    // Raycaster for clicking 3D panels
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(panelsGroup.children, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && hitObj.parent !== panelsGroup) {
          hitObj = hitObj.parent;
        }
        if (hitObj) {
          const found = panelMeshes.find((pm) => pm.group === hitObj);
          if (found) {
            const pItem = portraits.find((p) => p.id === found.id);
            if (pItem) {
              onSelectPortrait(pItem);
              celestialAudio.playBreeze();
            }
          }
        }
      }
    };

    container.addEventListener('click', handleCanvasClick);

    // ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Trees gently swaying in breeze
      frondMeshes.forEach((frond, idx) => {
        frond.rotation.z = Math.PI / 3 + Math.sin(elapsed * 2.2 + idx * 0.4) * 0.05;
      });
      grandTreeGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.03;
      cycadGroup.rotation.z = Math.cos(elapsed * 1.6) * 0.03;

      // Saree Fabric Breeze Wave on all panels
      panelMeshes.forEach((pm, pIdx) => {
        const geom = pm.imgMesh.geometry as THREE.PlaneGeometry;
        const pos = geom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          // Silk fluttering wave
          const wave = Math.sin(elapsed * 4.0 + u * 3.0 + v * 2.0 + pIdx) * 0.03;
          pos.setZ(i, 0.035 + wave);
        }
        pos.needsUpdate = true;
      });

      // Special Trigger 1: Blooming Flowers Animation
      const targetBloomScale = isBloomActive ? 1.0 : 0.01;
      flowerMeshes.forEach((fl, idx) => {
        const cur = fl.scale.x;
        const next = THREE.MathUtils.lerp(cur, targetBloomScale, 0.08);
        fl.scale.setScalar(next);
        fl.rotation.y = elapsed * 1.5 + idx;
      });

      // Special Trigger 2: Greyscale Transition & Autumn Leaves
      const targetLeafOpacity = isGreyscaleActive ? 0.85 : 0.0;
      leafMat.opacity = THREE.MathUtils.lerp(leafMat.opacity, targetLeafOpacity, 0.05);

      if (leafMat.opacity > 0.01) {
        const posAttr = leafGeom.attributes.position as THREE.BufferAttribute;
        const currentPos = posAttr.array as Float32Array;

        for (let i = 0; i < leafCount; i++) {
          currentPos[i * 3 + 1] -= leafSpeeds[i] * delta * (isGreyscaleActive ? 0.7 : 1.2);
          currentPos[i * 3] += Math.sin(elapsed * 1.2 + i) * 0.01;
          currentPos[i * 3 + 2] += Math.cos(elapsed * 1.2 + i) * 0.01;

          // Reset leaf at top
          if (currentPos[i * 3 + 1] < -1.2) {
            currentPos[i * 3 + 1] = 6.0;
            currentPos[i * 3] = (Math.random() - 0.5) * 12;
            currentPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Smooth Camera Zoom when a panel is selected
      if (selectedPortraitId) {
        const matched = panelMeshes.find((pm) => pm.id === selectedPortraitId);
        if (matched) {
          const targetDist = 2.4;
          const lookAtX = matched.group.position.x;
          const lookAtZ = matched.group.position.z;
          targetCamX = lookAtX + Math.sin(matched.baseAngle) * targetDist;
          targetCamY = 0.6;
          targetCamZ = lookAtZ + Math.cos(matched.baseAngle) * targetDist;
          targetLookX = lookAtX;
          targetLookY = 0.4;
          targetLookZ = lookAtZ;
        }
      } else {
        // Orbit slowly overview
        targetCamX = Math.sin(elapsed * 0.15) * 6.5;
        targetCamY = 2.0 + Math.sin(elapsed * 0.2) * 0.4;
        targetCamZ = Math.cos(elapsed * 0.15) * 6.5;
        targetLookX = 0;
        targetLookY = 0.2;
        targetLookZ = 0;
      }

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      camera.lookAt(targetLookX, targetLookY, targetLookZ);

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
      container.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      groundGeom.dispose();
      groundMat.dispose();
      leafGeom.dispose();
      leafMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedPortraitId, isGreyscaleActive, isBloomActive, portraits, onSelectPortrait]);

  return (
    <div className="relative w-full h-full min-h-[580px] sm:min-h-[660px] flex items-center justify-center select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className={`absolute inset-0 w-full h-full z-0 cursor-pointer transition-all duration-1000 ${
          isGreyscaleActive ? 'filter grayscale contrast-125' : ''
        }`}
      />

      {/* Special Interactive Trigger Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2">
        <button
          onClick={() => {
            onToggleBloom();
            celestialAudio.playSparkle(1.3);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-cinzel font-semibold tracking-wider transition-all duration-300 shadow-md flex items-center gap-1.5 border ${
            isBloomActive
              ? 'bg-amber-500 text-white border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
              : 'bg-black/50 text-amber-200 border-amber-500/30 backdrop-blur-md hover:bg-black/70'
          }`}
        >
          <span>🌸</span>
          <span>{isBloomActive ? 'Flora Blooming!' : 'Trigger Floral Bloom'}</span>
        </button>

        <button
          onClick={() => {
            onToggleGreyscale();
            celestialAudio.playBreeze();
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-cinzel font-semibold tracking-wider transition-all duration-300 shadow-md flex items-center gap-1.5 border ${
            isGreyscaleActive
              ? 'bg-zinc-200 text-zinc-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]'
              : 'bg-black/50 text-zinc-300 border-zinc-600/50 backdrop-blur-md hover:bg-black/70'
          }`}
        >
          <span>🍂</span>
          <span>{isGreyscaleActive ? 'Autumn Reverie Active' : 'Contemplative Autumn'}</span>
        </button>
      </div>

      {/* Floating Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
        <p className="text-xs sm:text-sm font-cormorant italic text-amber-200/90 drop-shadow-md bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-amber-400/20">
          Tap any 3D panel to walk closer • Trees & saree fabrics rustle gently in the golden hour breeze
        </p>
      </div>

      {/* Atmosphere Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#1c0f06]/30 to-[#0c0502]/90" />
    </div>
  );
}
