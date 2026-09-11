import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { celestialAudio } from '../utils/audio';

interface EtherealCanvasProps {
  image1Src: string;
  image2Src: string;
  onGestureTrigger?: () => void;
}

export default function EtherealCanvas({ image1Src, image2Src, onGestureTrigger }: EtherealCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gestureActive, setGestureActive] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<number>(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x180b22, 0.035);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Ethereal Lighting: Soft rose, pearl-white, and warm silver
    const ambientLight = new THREE.AmbientLight(0xfdf2f8, 1.4);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xf472b6, 3.2, 20);
    pinkLight.position.set(-3, 3, 3);
    scene.add(pinkLight);

    const silverLight = new THREE.PointLight(0xe0e7ff, 3.5, 20);
    silverLight.position.set(3, -2, 3);
    scene.add(silverLight);

    const artifactLight = new THREE.PointLight(0xfef08a, 2.8, 10);
    artifactLight.position.set(0, 0, 2.5);
    scene.add(artifactLight);

    // 1. ETHEREAL PINK & WHITE STARDUST CLOUD
    const dustCount = 1400;
    const dustGeom = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    const softColors = [
      new THREE.Color(0xfbcfe8), // Soft pink
      new THREE.Color(0xffffff), // Pearl white
      new THREE.Color(0xe0e7ff), // Silver indigo
      new THREE.Color(0xfef08a), // Pale gold zari
    ];

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 16;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const col = softColors[Math.floor(Math.random() * softColors.length)];
      dustColors[i * 3] = col.r;
      dustColors[i * 3 + 1] = col.g;
      dustColors[i * 3 + 2] = col.b;
    }

    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeom.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const dustCloud = new THREE.Points(dustGeom, dustMat);
    scene.add(dustCloud);

    // 2. THE SILVER CONSTELLATION: FLOATING TRANSLUCENT BEADED CRYSTAL PLATFORMS
    const platformsGroup = new THREE.Group();
    scene.add(platformsGroup);

    const platformMat = new THREE.MeshPhysicalMaterial({
      color: 0xfdf4ff,
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      roughness: 0.12,
      ior: 1.5,
      reflectivity: 0.7,
      metalness: 0.1,
    });

    const pearlRimMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfce7f3,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.3,
    });

    // Create 3 floating platforms
    const platformConfigs = [
      { x: -2.3, y: -1.3, z: -0.5, r: 1.4 },
      { x: 2.3, y: -1.2, z: -0.5, r: 1.4 },
      { x: 0, y: -2.1, z: 0.2, r: 2.0 },
    ];

    const platformMeshes: THREE.Group[] = [];

    platformConfigs.forEach((cfg) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(cfg.x, cfg.y, cfg.z);

      const discGeom = new THREE.CylinderGeometry(cfg.r, cfg.r * 1.05, 0.08, 32);
      const disc = new THREE.Mesh(discGeom, platformMat);
      pGroup.add(disc);

      // Pearl beaded rim around platform
      const beadCount = Math.floor(cfg.r * 24);
      for (let b = 0; b < beadCount; b++) {
        const bAngle = (b / beadCount) * Math.PI * 2;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), pearlRimMat);
        bead.position.set(Math.cos(bAngle) * cfg.r, 0.04, Math.sin(bAngle) * cfg.r);
        pGroup.add(bead);
      }

      platformsGroup.add(pGroup);
      platformMeshes.push(pGroup);
    });

    // 3. THE CENTRAL GLOWING MAANG TIKKA ARTIFACT
    const maangTikkaGroup = new THREE.Group();
    maangTikkaGroup.position.set(0, 0.2, 0.6);
    scene.add(maangTikkaGroup);

    const tikkaGoldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.95,
    });

    const tikkaSilverMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
    });

    const tikkaGemMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xbe123c,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.5,
    });

    // Ornate sacred chain leading upward (suspended hair chain)
    const chainLinks = 12;
    for (let c = 0; c < chainLinks; c++) {
      const link = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), tikkaSilverMat);
      link.position.set(0, 0.65 + c * 0.09, -c * 0.02);
      maangTikkaGroup.add(link);
    }

    // Top hair hook
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16, Math.PI * 1.5), tikkaGoldMat);
    hook.position.set(0, 0.65 + chainLinks * 0.09, -chainLinks * 0.02);
    hook.rotation.z = Math.PI / 4;
    maangTikkaGroup.add(hook);

    // Central Sunburst Medallion
    const medallionCore = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 24), tikkaGoldMat);
    medallionCore.rotation.x = Math.PI / 2;
    maangTikkaGroup.add(medallionCore);

    // Gem in center of medallion
    const centerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), tikkaGemMat);
    centerGem.position.z = 0.05;
    maangTikkaGroup.add(centerGem);

    // Radiating filigree spokes / sun rays
    const spokeCount = 16;
    for (let s = 0; s < spokeCount; s++) {
      const sAngle = (s / spokeCount) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 4), tikkaGoldMat);
      spoke.position.set(Math.cos(sAngle) * 0.38, Math.sin(sAngle) * 0.38, 0);
      spoke.rotation.z = sAngle - Math.PI / 2;
      maangTikkaGroup.add(spoke);

      // Pearl tip on spoke
      const spokePearl = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), pearlRimMat);
      spokePearl.position.set(Math.cos(sAngle) * 0.48, Math.sin(sAngle) * 0.48, 0);
      maangTikkaGroup.add(spokePearl);
    }

    // Lower hanging crescent with pearl drops
    const crescentGeom = new THREE.TorusGeometry(0.25, 0.03, 8, 24, Math.PI);
    const crescent = new THREE.Mesh(crescentGeom, tikkaGoldMat);
    crescent.position.y = -0.32;
    crescent.rotation.z = Math.PI;
    maangTikkaGroup.add(crescent);

    // Dangling teardrop pearls from crescent
    const pearlDrops = [-0.18, -0.09, 0, 0.09, 0.18];
    pearlDrops.forEach((pX, idx) => {
      const pDrop = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 8), pearlRimMat);
      pDrop.rotation.x = Math.PI;
      pDrop.position.set(pX, -0.42 - Math.abs(idx - 2) * 0.03, 0);
      maangTikkaGroup.add(pDrop);
    });

    // Radiant Starlight Halo around Maang Tikka
    const haloGeom = new THREE.RingGeometry(0.65, 0.72, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.position.z = -0.05;
    maangTikkaGroup.add(halo);

    // 4. 3D ANIMATED FEATURED PANELS (image_1.png and image_2.png)
    const textureLoader = new THREE.TextureLoader();
    const tex1 = textureLoader.load(image1Src);
    const tex2 = textureLoader.load(image2Src);

    const createPanel = (tex: THREE.Texture, posX: number, rotY: number) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(posX, 0.3, 0.1);
      pGroup.rotation.y = rotY;

      // Card frame
      const frameGeom = new THREE.BoxGeometry(1.6, 2.15, 0.06);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xfdf4ff,
        emissive: 0xfbcfe8,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.7,
      });
      const frame = new THREE.Mesh(frameGeom, frameMat);
      pGroup.add(frame);

      // Image Plane
      const imgGeom = new THREE.PlaneGeometry(1.5, 2.05);
      const imgMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95 });
      const imgMesh = new THREE.Mesh(imgGeom, imgMat);
      imgMesh.position.z = 0.035;
      pGroup.add(imgMesh);

      // Beaded border
      const pBorderCount = 20;
      for (let i = 0; i < pBorderCount; i++) {
        const t = (i / pBorderCount) * 2 - 1;
        const bTop = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pearlRimMat);
        bTop.position.set(t * 0.75, 1.05, 0.04);
        pGroup.add(bTop);

        const bBot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pearlRimMat);
        bBot.position.set(t * 0.75, -1.05, 0.04);
        pGroup.add(bBot);
      }

      scene.add(pGroup);
      return pGroup;
    };

    const panel1 = createPanel(tex1, -2.1, 0.25);
    const panel2 = createPanel(tex2, 2.1, -0.25);

    // 5. PEARL LIGHT BEAMS SCATTER (Triggered on Tap/Gesture)
    const beamCount = 500;
    const beamGeom = new THREE.BufferGeometry();
    const beamPositions = new Float32Array(beamCount * 3);
    const beamVelocities = new Float32Array(beamCount * 3);
    const beamColors = new Float32Array(beamCount * 3);

    for (let i = 0; i < beamCount; i++) {
      beamPositions[i * 3] = 0;
      beamPositions[i * 3 + 1] = 0;
      beamPositions[i * 3 + 2] = 0.6;

      const phi = Math.acos(Math.random() * 2 - 1);
      const theta = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 2.5;

      beamVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      beamVelocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      beamVelocities[i * 3 + 2] = speed * Math.cos(phi);

      beamColors[i * 3] = 1.0;
      beamColors[i * 3 + 1] = 0.95;
      beamColors[i * 3 + 2] = 1.0;
    }

    beamGeom.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));
    beamGeom.setAttribute('color', new THREE.BufferAttribute(beamColors, 3));

    const beamMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const beamPoints = new THREE.Points(beamGeom, beamMat);
    scene.add(beamPoints);

    // FLOWING EMBROIDERY WAVE EFFECT ON ARCHITECTURE
    let gestureProgress = 0;
    let isGestureRunning = false;

    // Mouse & Swipe interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetX = x * 0.4;
      targetY = -y * 0.3;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        targetX = x * 0.4;
        targetY = -y * 0.3;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Trigger gesture method
    const triggerGesture = () => {
      isGestureRunning = true;
      gestureProgress = 0;
      setGestureActive(true);
      celestialAudio.playSparkle(1.4);

      // Reset beam positions to Maang Tikka
      const posAttr = beamGeom.attributes.position as THREE.BufferAttribute;
      const curPos = posAttr.array as Float32Array;
      for (let i = 0; i < beamCount; i++) {
        curPos[i * 3] = 0;
        curPos[i * 3 + 1] = 0.2;
        curPos[i * 3 + 2] = 0.6;
      }
      posAttr.needsUpdate = true;
    };

    // Store trigger ref for external UI button
    (container as unknown as { triggerGestureFn?: () => void }).triggerGestureFn = triggerGesture;

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera / group parallax
      maangTikkaGroup.rotation.y += (targetX - maangTikkaGroup.rotation.y) * 0.06;
      maangTikkaGroup.rotation.x += (targetY - maangTikkaGroup.rotation.x) * 0.06;
      maangTikkaGroup.position.y = 0.2 + Math.sin(elapsed * 1.6) * 0.06;

      // Halo shimmer & pulse
      halo.rotation.z = elapsed * 0.4;
      haloMat.opacity = 0.4 + Math.sin(elapsed * 4) * 0.3;

      // Floating platforms undulating float
      platformMeshes.forEach((pMesh, idx) => {
        pMesh.position.y = platformConfigs[idx].y + Math.sin(elapsed * 1.2 + idx * 1.5) * 0.08;
        pMesh.rotation.y = elapsed * 0.08 * (idx % 2 === 0 ? 1 : -1);
      });

      // Panels 3D depth tilt & gentle breathing
      panel1.rotation.y = 0.25 + Math.sin(elapsed * 1.5) * 0.05 + targetX * 0.2;
      panel1.position.y = 0.3 + Math.sin(elapsed * 1.2) * 0.05;
      panel2.rotation.y = -0.25 - Math.sin(elapsed * 1.5) * 0.05 + targetX * 0.2;
      panel2.position.y = 0.3 + Math.cos(elapsed * 1.2) * 0.05;

      // Stardust slow drift
      dustCloud.rotation.y = elapsed * 0.03;
      dustCloud.rotation.x = Math.sin(elapsed * 0.06) * 0.04;

      // Gestural mudra pearl beam explosion
      if (isGestureRunning) {
        gestureProgress += delta * 1.2;
        beamMat.opacity = Math.max(0, 1.0 - gestureProgress * 0.8);

        const posAttr = beamGeom.attributes.position as THREE.BufferAttribute;
        const curPos = posAttr.array as Float32Array;

        for (let i = 0; i < beamCount; i++) {
          curPos[i * 3] += beamVelocities[i * 3] * delta * 2.0;
          curPos[i * 3 + 1] += beamVelocities[i * 3 + 1] * delta * 2.0;
          curPos[i * 3 + 2] += beamVelocities[i * 3 + 2] * delta * 2.0;
        }
        posAttr.needsUpdate = true;

        // Animate flowing embroidery pattern across platforms
        platformMat.emissive = new THREE.Color(0xf472b6);
        platformMat.emissiveIntensity = Math.sin(gestureProgress * Math.PI) * 0.8;

        if (gestureProgress >= 1.4) {
          isGestureRunning = false;
          setGestureActive(false);
          beamMat.opacity = 0;
          platformMat.emissiveIntensity = 0;
        }
      }

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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      dustGeom.dispose();
      dustMat.dispose();
      beamGeom.dispose();
      beamMat.dispose();
      tex1.dispose();
      tex2.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [image1Src, image2Src]);

  const handleTrigger = () => {
    const container = containerRef.current as unknown as { triggerGestureFn?: () => void };
    if (container?.triggerGestureFn) {
      container.triggerGestureFn();
    }
    if (onGestureTrigger) {
      onGestureTrigger();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] sm:min-h-[640px] flex items-center justify-center select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        onClick={handleTrigger}
        className="absolute inset-0 w-full h-full z-0 cursor-pointer"
      />

      {/* Floating Interactive Controls & Mudra Trigger */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleTrigger}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-cinzel font-semibold tracking-wider transition-all duration-300 shadow-lg flex items-center gap-2 border ${
            gestureActive
              ? 'bg-pink-500 text-white border-pink-300 shadow-[0_0_25px_rgba(236,72,153,0.8)] scale-105'
              : 'bg-white/10 hover:bg-white/20 text-pink-100 border-pink-200/30 backdrop-blur-md hover:shadow-[0_0_20px_rgba(244,114,182,0.4)]'
          }`}
        >
          <span>✨</span>
          <span>{gestureActive ? 'Pearl Light Scattering...' : 'Tap for Graceful Gesture'}</span>
        </button>

        <span className="text-[11px] font-cormorant italic text-pink-200/70 tracking-wide">
          Interactive: Tap canvas or Maang Tikka to scatter pearl beams
        </span>
      </div>

      {/* Ethereal Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#10061a]/30 to-[#0c0414]/90" />
    </div>
  );
}
