import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GoldenCore3DProps {
  isExecuting?: boolean;
}

export const GoldenCore3D: React.FC<GoldenCore3DProps> = ({ isExecuting = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 260;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfff5cc, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 2.5, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0xb38b2d, 1.5, 50);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // 5. 3D Objects - Royal Gold Core (Icosahedron + Ring Orbits + Particles)
    const coreGroup = new THREE.Group();

    // Central Golden Crystal/Core
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
      emissive: 0x4a3205,
      emissiveIntensity: 0.4
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Outer Wireframe Shield
    const wireGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf5d061,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // Dynamic Orbital Golden Rings
    const ringGeo1 = new THREE.TorusGeometry(1.6, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.1 });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    coreGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(1.9, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({ color: 0xcca033, metalness: 0.8, roughness: 0.2 });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    coreGroup.add(ringMesh2);

    // Golden Particle Field (Nodes)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfce8a6,
      size: 0.04,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particles);

    scene.add(coreGroup);

    // 6. Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    container.addEventListener('mousemove', onMouseMove);

    // 7. Animation Loop
    let animId: number;
    const speedMultiplier = isExecuting ? 3.0 : 1.0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      coreMesh.rotation.x += 0.005 * speedMultiplier;
      coreMesh.rotation.y += 0.008 * speedMultiplier;

      wireMesh.rotation.x -= 0.003 * speedMultiplier;
      wireMesh.rotation.y -= 0.005 * speedMultiplier;

      ringMesh1.rotation.z += 0.01 * speedMultiplier;
      ringMesh2.rotation.x += 0.008 * speedMultiplier;

      particles.rotation.y += 0.002 * speedMultiplier;

      // Parallax hover effect
      coreGroup.rotation.y += (mouseX * 0.5 - coreGroup.rotation.y) * 0.05;
      coreGroup.rotation.x += (-mouseY * 0.5 - coreGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isExecuting]);

  return (
    <div className="relative w-full h-full min-h-[220px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#13141F] to-[#0A0B12] border border-[#D4AF37]/30 shadow-inner">
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 left-3 text-[10px] font-mono text-[#E5A93C] flex items-center gap-1.5 pointer-events-none select-none bg-[#090A10]/80 px-2 py-0.5 rounded border border-[#D4AF37]/20">
        <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
        <span>Three.js 3D Agent Core</span>
      </div>
    </div>
  );
};
