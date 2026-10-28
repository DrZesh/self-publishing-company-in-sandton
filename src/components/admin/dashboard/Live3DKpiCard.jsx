import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Live3DKpiCard({ title, value, subtitle, icon: Icon, color, loading }) {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || loading) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(80, 80);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Create 3D icon geometry
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      shininess: 100,
      specular: 0x444444,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 50;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 4;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 3;

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      sphere.rotation.x += 0.005;
      sphere.rotation.y += 0.005;
      particles.rotation.y -= 0.002;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      container.innerHTML = '';
    };
  }, [color, loading]);

  // Mouse parallax effect
  const handleMouseMove = (e) => {
    if (loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotation({ x: y * 10, y: x * 10 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated background glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl animate-pulse"
        style={{ background: color }}
      />

      {/* 3D Icon Container */}
      <div className="flex items-start justify-between mb-3">
        <div
          ref={containerRef}
          className="w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: `${color}25`,
            boxShadow: `inset 0 0 20px ${color}40`,
          }}
        />
        {Icon && <Icon className="w-6 h-6" style={{ color: color }} />}
      </div>

      {/* Value */}
      <p className="text-3xl font-black text-white tracking-tight mb-1">
        {loading ? '—' : value}
      </p>

      {/* Title */}
      <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-0.5">
        {title}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[10px] font-medium text-white/40">
          {subtitle}
        </p>
      )}

      {/* Live indicator */}
      {!loading && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}