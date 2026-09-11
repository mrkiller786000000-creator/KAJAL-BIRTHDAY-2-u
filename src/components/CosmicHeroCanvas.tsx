import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { celestialAudio } from '../utils/audio';

interface CosmicHeroCanvasProps {
  portraitSrc: string;
  isTextHovered: boolean;
  onExploreClick: () => void;
}

export default function CosmicHeroCanvas({
  portraitSrc,
  isTextHovered,
  onExploreClick,
}: CosmicHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(false);
  const [jhumkaTwinkleActive, setJhumkaTwinkleActive] = useState<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04020a, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x2e1065, 1.8);
    scene.add(ambientLight);

    const mainPointLight = new THREE.PointLight(0xd946ef, 3.5, 20);
    mainPointLight.position.set(0, 2, 4);
    scene.add(mainPointLight);

    const blueLight = new THREE.PointLight(0x1e40af, 4, 25);
    blueLight.position.set(-4, -1, 3);
    scene.add(blueLight);

    const goldLight = new THREE.PointLight(0xfbbf24, 2.5, 18);
    goldLight.position.set(4, 2, 2);
    scene.add(goldLight);

    // 1. STARFIELD & SWIRLING NEBULA PARTICLES
    const starCount = 2200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color(0xd946ef), // Magenta
      new THREE.Color(0x1e40af), // Deep blue
      new THREE.Color(0x38bdf8), // Starlight cyan
      new THREE.Color(0xfef08a), // Golden shimmer
      new THREE.Color(0xffffff), // Pure white
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 8 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;

      starSizes[i] = Math.random() * 2.5 + 0.8;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Swirling Nebula Dust Cloud
    const nebulaCount = 600;
    const nebulaGeom = new THREE.BufferGeometry();
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      const angle = (i / nebulaCount) * Math.PI * 4 + Math.random() * 0.5;
      const dist = 1.5 + Math.random() * 4.5;
      const height = (Math.random() - 0.5) * 3.5;

      nebulaPositions[i * 3] = Math.cos(angle) * dist;
      nebulaPositions[i * 3 + 1] = height + Math.sin(angle * 2) * 0.4;
      nebulaPositions[i * 3 + 2] = Math.sin(angle) * dist - 1.0;

      const isMagenta = Math.random() > 0.45;
      const col = isMagenta ? new THREE.Color(0xd946ef) : new THREE.Color(0x2563eb);
      nebulaColors[i * 3] = col.r;
      nebulaColors[i * 3 + 1] = col.g;
      nebulaColors[i * 3 + 2] = col.b;
    }
    nebulaGeom.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeom.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const nebula = new THREE.Points(nebulaGeom, nebulaMaterial);
    scene.add(nebula);

    // 2. THE CRYSTAL CORE: RADIANT BIRTHDAY CAKE CRYSTAL STRUCTURE
    const cakeCrystalGroup = new THREE.Group();
    scene.add(cakeCrystalGroup);

    // Tier 1: Base Faceted Cake Layer (Faceted Octagonal Beveled Crystal)
    const baseGeom = new THREE.CylinderGeometry(1.65, 1.85, 0.65, 10, 2);
    const crystalBaseMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x2e1065,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.85,
      flatShading: true,
    });
    const baseMesh = new THREE.Mesh(baseGeom, crystalBaseMat);
    baseMesh.position.y = -1.2;
    cakeCrystalGroup.add(baseMesh);

    // Wireframe glowing rim on base
    const baseWireGeom = new THREE.WireframeGeometry(baseGeom);
    const baseWireMat = new THREE.LineBasicMaterial({ color: 0xd946ef, transparent: true, opacity: 0.7 });
    const baseWire = new THREE.LineSegments(baseWireGeom, baseWireMat);
    baseWire.position.copy(baseMesh.position);
    cakeCrystalGroup.add(baseWire);

    // Tier 2: Mid Faceted Cake Layer (Deep Blue & Magenta Reflecting Prisms)
    const midGeom = new THREE.CylinderGeometry(1.3, 1.45, 0.6, 8, 2);
    const crystalMidMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true,
    });
    const midMesh = new THREE.Mesh(midGeom, crystalMidMat);
    midMesh.position.y = -0.55;
    cakeCrystalGroup.add(midMesh);

    // Tier 3: Crown Faceted Layer
    const crownGeom = new THREE.CylinderGeometry(0.95, 1.1, 0.45, 8, 1);
    const crystalCrownMat = new THREE.MeshStandardMaterial({
      color: 0x3b0764,
      emissive: 0xa21caf,
      emissiveIntensity: 0.8,
      roughness: 0.25,
      metalness: 0.75,
      flatShading: true,
    });
    const crownMesh = new THREE.Mesh(crownGeom, crystalCrownMat);
    crownMesh.position.y = -0.05;
    cakeCrystalGroup.add(crownMesh);

    // Sparkling Crystalline Candle Spires on Top
    const spireGroup = new THREE.Group();
    const spireGeom = new THREE.ConeGeometry(0.06, 0.4, 6);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2,
      metalness: 0.9,
    });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const r = 0.7;
      const spire = new THREE.Mesh(spireGeom, spireMat);
      spire.position.set(Math.cos(angle) * r, 0.35, Math.sin(angle) * r);
      spireGroup.add(spire);

      // Flame particle on each spire
      const flameGeom = new THREE.SphereGeometry(0.04, 8, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
      const flame = new THREE.Mesh(flameGeom, flameMat);
      flame.position.set(Math.cos(angle) * r, 0.58, Math.sin(angle) * r);
      spireGroup.add(flame);
    }
    cakeCrystalGroup.add(spireGroup);

    // 3. CENTRAL 3D ANIMATED PORTRAIT WITH BLINKING & GLOW
    // Canvas texture for the blinking portrait
    const portraitCanvas = document.createElement('canvas');
    portraitCanvas.width = 512;
    portraitCanvas.height = 680;
    const pctx = portraitCanvas.getContext('2d')!;

    const rawImg = new Image();
    rawImg.crossOrigin = 'anonymous';
    rawImg.src = portraitSrc;

    let isBlinking = false;
    let blinkTimer = 0;

    const portraitTexture = new THREE.CanvasTexture(portraitCanvas);
    portraitTexture.minFilter = THREE.LinearFilter;

    const drawPortrait = () => {
      if (!rawImg.complete) return;
      pctx.clearRect(0, 0, 512, 680);
      // Draw image
      pctx.drawImage(rawImg, 0, 0, 512, 680);

      // Soft vignette
      const grad = pctx.createRadialGradient(256, 340, 180, 256, 340, 360);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.8, 'rgba(10,5,25,0.4)');
      grad.addColorStop(1, 'rgba(5,2,15,0.9)');
      pctx.fillStyle = grad;
      pctx.fillRect(0, 0, 512, 680);

      // Blinking simulation: gentle eyelash veil when blink is active
      if (isBlinking) {
        pctx.fillStyle = 'rgba(40, 20, 30, 0.75)';
        pctx.beginPath();
        // Eye level curve approximation
        pctx.ellipse(215, 275, 28, 9, 0.05, 0, Math.PI * 2);
        pctx.ellipse(305, 275, 28, 9, -0.05, 0, Math.PI * 2);
        pctx.fill();
      }

      portraitTexture.needsUpdate = true;
    };

    rawImg.onload = () => {
      drawPortrait();
    };

    // Portrait Plane
    const portraitGeom = new THREE.PlaneGeometry(1.65, 2.2);
    const portraitMat = new THREE.MeshStandardMaterial({
      map: portraitTexture,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.96,
    });
    const portraitMesh = new THREE.Mesh(portraitGeom, portraitMat);
    portraitMesh.position.set(0, 0.65, 0.95);
    cakeCrystalGroup.add(portraitMesh);

    // Ornate Crystalline Gem Frame around portrait
    const frameGeom = new THREE.BoxGeometry(1.75, 2.3, 0.08);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x78350f,
      roughness: 0.2,
      metalness: 0.9,
    });
    const frameMesh = new THREE.Mesh(frameGeom, frameMat);
    frameMesh.position.set(0, 0.65, 0.90);
    cakeCrystalGroup.add(frameMesh);

    // Corner Rubies
    const cornerRubyGeom = new THREE.OctahedronGeometry(0.1, 0);
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xbe185d,
      roughness: 0.1,
      metalness: 0.8,
    });
    const corners = [
      [-0.85, 1.78],
      [0.85, 1.78],
      [-0.85, -0.48],
      [0.85, -0.48],
    ];
    corners.forEach(([cx, cy]) => {
      const ruby = new THREE.Mesh(cornerRubyGeom, rubyMat);
      ruby.position.set(cx, cy, 0.96);
      cakeCrystalGroup.add(ruby);
    });

    // 4. 3D FULLY MODELED KINETIC GOLDEN JHUMKA EARRINGS & CHAINS
    // Each jhumka has:
    // - Top Stud (golden floral dome)
    // - Suspension connector ring
    // - Main Bell-shaped filigree Jhumka dome
    // - Multiple long hanging chains with golden beads and hanging pearls
    const createJhumka = (side: 'left' | 'right') => {
      const jhumkaGroup = new THREE.Group();
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xb45309,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.95,
      });

      const pearlMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfce7f3,
        emissiveIntensity: 0.3,
        roughness: 0.1,
        metalness: 0.2,
      });

      // Top floral stud
      const studGeom = new THREE.SphereGeometry(0.08, 12, 12);
      const stud = new THREE.Mesh(studGeom, goldMat);
      jhumkaGroup.add(stud);

      // Intermediate connector ring
      const ringGeom = new THREE.TorusGeometry(0.06, 0.015, 8, 16);
      const ring = new THREE.Mesh(ringGeom, goldMat);
      ring.position.y = -0.12;
      jhumkaGroup.add(ring);

      // Main Jhumka Bell Dome
      const bellGroup = new THREE.Group();
      bellGroup.position.y = -0.22;

      const domeGeom = new THREE.CylinderGeometry(0.18, 0.26, 0.22, 16, 1, true);
      const dome = new THREE.Mesh(domeGeom, goldMat);
      bellGroup.add(dome);

      // Cap on dome
      const capGeom = new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const cap = new THREE.Mesh(capGeom, goldMat);
      cap.position.y = 0.11;
      bellGroup.add(cap);

      // Scalloped filigree rim beads
      for (let b = 0; b < 12; b++) {
        const bAngle = (b / 12) * Math.PI * 2;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), goldMat);
        bead.position.set(Math.cos(bAngle) * 0.26, -0.11, Math.sin(bAngle) * 0.26);
        bellGroup.add(bead);
      }

      // Chains container (for dynamic elongation when hovered!)
      const chainsGroup = new THREE.Group();
      chainsGroup.name = 'chains';
      chainsGroup.position.y = -0.12;

      // 5 hanging chain strands
      const chainOffsets = [-0.16, -0.08, 0, 0.08, 0.16];
      const linkCount = 7;

      chainOffsets.forEach((offsetX, cIdx) => {
        const chainStrand = new THREE.Group();
        chainStrand.name = `strand_${cIdx}`;
        chainStrand.position.x = offsetX;
        chainStrand.position.z = (Math.random() - 0.5) * 0.06;

        for (let l = 0; l < linkCount; l++) {
          const isTip = l === linkCount - 1;
          const link = new THREE.Mesh(
            isTip ? new THREE.SphereGeometry(0.045, 10, 10) : new THREE.SphereGeometry(0.022, 8, 8),
            isTip ? pearlMat : goldMat
          );
          link.position.y = -l * 0.09;
          chainStrand.add(link);
        }
        chainsGroup.add(chainStrand);
      });

      bellGroup.add(chainsGroup);
      jhumkaGroup.add(bellGroup);

      // Position relative to Kajal portrait
      const posX = side === 'left' ? -0.92 : 0.92;
      jhumkaGroup.position.set(posX, 0.72, 1.05);

      return { group: jhumkaGroup, bell: bellGroup, chains: chainsGroup, goldMat, pearlMat };
    };

    const leftJhumka = createJhumka('left');
    const rightJhumka = createJhumka('right');
    cakeCrystalGroup.add(leftJhumka.group);
    cakeCrystalGroup.add(rightJhumka.group);

    // 5. CASCADING PARTICLES ORBITING CRYSTAL (Active on hover over "HAPPY BIRTHDAY, KAJAL")
    const orbitParticleCount = 800;
    const orbitGeom = new THREE.BufferGeometry();
    const orbitPos = new Float32Array(orbitParticleCount * 3);
    const orbitColors = new Float32Array(orbitParticleCount * 3);
    const orbitSpeeds = new Float32Array(orbitParticleCount);
    const orbitRadii = new Float32Array(orbitParticleCount);
    const orbitYOffsets = new Float32Array(orbitParticleCount);

    for (let i = 0; i < orbitParticleCount; i++) {
      orbitRadii[i] = 1.8 + Math.random() * 2.2;
      orbitSpeeds[i] = 0.8 + Math.random() * 1.5;
      orbitYOffsets[i] = (Math.random() - 0.5) * 3.5;

      const angle = Math.random() * Math.PI * 2;
      orbitPos[i * 3] = Math.cos(angle) * orbitRadii[i];
      orbitPos[i * 3 + 1] = orbitYOffsets[i];
      orbitPos[i * 3 + 2] = Math.sin(angle) * orbitRadii[i];

      const isGold = Math.random() > 0.45;
      const col = isGold ? new THREE.Color(0xfbbf24) : new THREE.Color(0xf43f5e);
      orbitColors[i * 3] = col.r;
      orbitColors[i * 3 + 1] = col.g;
      orbitColors[i * 3 + 2] = col.b;
    }

    orbitGeom.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
    orbitGeom.setAttribute('color', new THREE.BufferAttribute(orbitColors, 3));

    const orbitMat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.2, // Boosted on hover
      blending: THREE.AdditiveBlending,
    });
    const orbitParticles = new THREE.Points(orbitGeom, orbitMat);
    scene.add(orbitParticles);

    // MOUSE & GYROSCOPE INTERACTIVITY
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let prevMouseX = 0;
    let mouseVelocity = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetRotY = x * 0.35;
      targetRotX = -y * 0.2;

      mouseVelocity = Math.abs(x - prevMouseX) * 15;
      prevMouseX = x;
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        targetRotY = (e.gamma / 45) * 0.4;
        targetRotX = ((e.beta - 45) / 45) * 0.25;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    // ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let jhumkaSwayAngle = 0;
    let chainScaleY = 1.0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Blinking logic (every 3.5 - 5 seconds)
      blinkTimer += delta;
      if (blinkTimer > 3.8) {
        isBlinking = true;
        drawPortrait();
        if (blinkTimer > 4.05) {
          isBlinking = false;
          drawPortrait();
          blinkTimer = 0;
        }
      }

      // Smooth cake crystal float & orientation damping
      cakeCrystalGroup.rotation.y += (targetRotY - cakeCrystalGroup.rotation.y) * 0.05;
      cakeCrystalGroup.rotation.x += (targetRotX - cakeCrystalGroup.rotation.x) * 0.05;
      cakeCrystalGroup.position.y = Math.sin(elapsed * 1.4) * 0.08;

      // Base rotation
      baseMesh.rotation.y = elapsed * 0.15;
      baseWire.rotation.y = elapsed * 0.15;
      midMesh.rotation.y = -elapsed * 0.18;
      crownMesh.rotation.y = elapsed * 0.22;

      // Stars slow rotation & twinkling
      starField.rotation.y = elapsed * 0.02;
      starField.rotation.x = Math.sin(elapsed * 0.05) * 0.05;
      nebula.rotation.y = -elapsed * 0.04;

      // Hover interaction on "HAPPY BIRTHDAY, KAJAL"
      const isTriggered = isTextHovered || interactiveMode || jhumkaTwinkleActive;
      const targetChainScale = isTriggered ? 1.55 : 1.0;
      chainScaleY += (targetChainScale - chainScaleY) * 0.08;

      leftJhumka.chains.scale.y = chainScaleY;
      rightJhumka.chains.scale.y = chainScaleY;

      // Kinetic jhumka earrings realistic pendulum sway
      mouseVelocity *= 0.94; // Velocity damping
      const dynamicSway = Math.sin(elapsed * 3.5) * (0.12 + mouseVelocity * 0.3);
      jhumkaSwayAngle += (dynamicSway - jhumkaSwayAngle) * 0.1;

      leftJhumka.bell.rotation.z = jhumkaSwayAngle;
      leftJhumka.bell.rotation.x = Math.cos(elapsed * 2.8) * 0.08;
      rightJhumka.bell.rotation.z = jhumkaSwayAngle * 0.95;
      rightJhumka.bell.rotation.x = Math.sin(elapsed * 2.8) * 0.08;

      // Twinkle emissive intensity boost on hover
      const emissiveBoost = isTriggered ? 1.4 : 0.4;
      leftJhumka.goldMat.emissiveIntensity = THREE.MathUtils.lerp(
        leftJhumka.goldMat.emissiveIntensity,
        emissiveBoost + Math.sin(elapsed * 10) * 0.3,
        0.1
      );
      rightJhumka.goldMat.emissiveIntensity = leftJhumka.goldMat.emissiveIntensity;

      // Orbit particles cascade
      orbitMat.opacity = THREE.MathUtils.lerp(orbitMat.opacity, isTriggered ? 0.95 : 0.25, 0.08);
      const posAttr = orbitGeom.attributes.position as THREE.BufferAttribute;
      const currentPos = posAttr.array as Float32Array;

      const orbitSpeedMultiplier = isTriggered ? 2.5 : 0.9;
      for (let i = 0; i < orbitParticleCount; i++) {
        const speed = orbitSpeeds[i] * orbitSpeedMultiplier;
        const radius = orbitRadii[i] + (isTriggered ? Math.sin(elapsed * 3 + i) * 0.3 : 0);
        const curAngle = elapsed * speed + i;
        currentPos[i * 3] = Math.cos(curAngle) * radius;
        currentPos[i * 3 + 1] = orbitYOffsets[i] + Math.sin(curAngle * 2) * 0.4;
        currentPos[i * 3 + 2] = Math.sin(curAngle) * radius;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
      window.removeEventListener('resize', handleResize);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      nebulaGeom.dispose();
      nebulaMaterial.dispose();
      orbitGeom.dispose();
      orbitMat.dispose();
      portraitTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [portraitSrc, isTextHovered, interactiveMode, jhumkaTwinkleActive]);

  return (
    <div className="relative w-full h-full min-h-[580px] sm:min-h-[640px] flex items-center justify-center select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Floating Interactive Badge & Quick Controls */}
      <div className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-2">
        <button
          onClick={() => {
            setJhumkaTwinkleActive(!jhumkaTwinkleActive);
            celestialAudio.playSparkle(1.2);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wider border backdrop-blur-md transition-all ${
            jhumkaTwinkleActive
              ? 'bg-amber-400/20 text-amber-200 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : 'bg-black/40 text-slate-300 border-white/10 hover:border-pink-500/40'
          }`}
        >
          ✨ {jhumkaTwinkleActive ? 'Jhumkas Active' : 'Sway & Twinkle'}
        </button>
      </div>

      {/* Hero Atmosphere Shimmer Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#04020a]/20 to-[#04020a]/80" />
    </div>
  );
}
