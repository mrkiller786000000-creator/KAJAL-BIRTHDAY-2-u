import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface Preloader3DProps {
  onComplete: () => void;
}

export default function Preloader3D({ onComplete }: Preloader3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(180, 180);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Glowing crystal icosahedron
    const geom = new THREE.IcosahedronGeometry(1.2, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: 0x3b0764,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const wireMesh = new THREE.Mesh(geom, wireMat);
    wireMesh.scale.setScalar(1.02);
    scene.add(wireMesh);

    // Starlight ring
    const ringGeom = new THREE.TorusGeometry(1.8, 0.04, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    const light1 = new THREE.PointLight(0xd946ef, 3, 10);
    light1.position.set(2, 2, 2);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x38bdf8, 3, 10);
    light2.position.set(-2, -2, 2);
    scene.add(light2);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      mesh.rotation.x = elapsed * 0.8;
      mesh.rotation.y = elapsed * 1.1;
      wireMesh.rotation.x = elapsed * 0.8;
      wireMesh.rotation.y = elapsed * 1.1;
      ring.rotation.z = -elapsed * 1.5;
      renderer.render(scene, camera);
    };

    animate();

    const timer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
      wireMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05020c] text-center px-4"
    >
      <div className="relative mb-6">
        <div ref={mountRef} className="w-[180px] h-[180px] mx-auto filter drop-shadow-[0_0_35px_rgba(217,70,239,0.5)]" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Sparkles className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <motion.h2
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl sm:text-3xl font-cinzel font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-amber-200 to-indigo-300 mb-3"
      >
        KAJAL'S STARLIT SPECTRUM
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.4 }}
        className="text-sm font-cormorant text-pink-200/80 tracking-wider italic max-w-sm mb-6"
      >
        Aligning celestial nebulae & polishing crystal facets...
      </motion.p>

      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden p-[1px]">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          className="h-full bg-gradient-to-r from-pink-500 via-amber-400 to-indigo-500 rounded-full"
        />
      </div>
    </motion.div>
  );
}
