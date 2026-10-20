import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Disc3, Play, Pause, RotateCw, Volume2 } from "lucide-react";

/**
 * Komponen Audiovisual 3D Vinyl Turntable interaktif.
 * Dibangun menggunakan Three.js dengan rotasi piringan hitam, tekstur groove fisik,
 * pantulan specular dinamis, arm jarum yang bergerak, dan partikel spasial audio.
 */
export default function VinylVisualizer3D({
  songInfo,
  isPlaying,
  onPlayPause,
  currentTime = 0,
  duration = 216,
  themeColor = "#00f0ff",
  className = "",
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const vinylMeshRef = useRef(null);
  const tonearmGroupRef = useRef(null);
  const particlesRef = useRef(null);
  const labelMeshRef = useRef(null);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const [isHovered, setIsHovered] = useState(false);

  // Buat tekstur prosedural untuk alur piringan hitam (vinyl groove texture)
  const createVinylTexture = useCallback(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Latar belakang hitam pekat vinyl
    ctx.fillStyle = "#0c0d10";
    ctx.fillRect(0, 0, size, size);

    const center = size / 2;

    // Alur melingkar (grooves) dengan berbagai ketebalan
    for (let r = 85; r < center - 6; r += 1.8) {
      const alpha = 0.08 + Math.sin(r * 2.5) * 0.06;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Efek pantulan cahaya anistropik (specular vinyl sheen)
    const sheenGradient = ctx.createRadialGradient(center, center, 80, center, center, center);
    sheenGradient.addColorStop(0, "rgba(255, 255, 255, 0.0)");
    sheenGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.04)");
    sheenGradient.addColorStop(0.9, "rgba(255, 255, 255, 0.08)");
    sheenGradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    ctx.fillStyle = sheenGradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Update tekstur cover art pada sticker tengah piringan
  useEffect(() => {
    if (!labelMeshRef.current || !songInfo?.coverArt) return;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      songInfo.coverArt,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        if (labelMeshRef.current && labelMeshRef.current.material) {
          labelMeshRef.current.material.map = texture;
          labelMeshRef.current.material.needsUpdate = true;
        }
      },
      undefined,
      (err) => {
        console.warn("Gagal memuat tekstur cover art piringan 3D:", err);
      }
    );
  }, [songInfo?.coverArt]);

  // Inisialisasi Scene Three.js
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Pencahayaan Dinamis (Studio Vinyl Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(4, 6, 6);
    scene.add(directionalLight);

    const rimLight = new THREE.PointLight(themeColor, 3.5, 15);
    rimLight.position.set(-5, -3, 4);
    scene.add(rimLight);

    // 4. Geometri Piringan Hitam (Vinyl Disc)
    const vinylGroup = new THREE.Group();
    scene.add(vinylGroup);
    vinylMeshRef.current = vinylGroup;

    // Body piringan
    const vinylGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.08, 64);
    const vinylTex = createVinylTexture();
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      metalness: 0.85,
      roughness: 0.35,
      map: vinylTex,
    });
    const vinylBody = new THREE.Mesh(vinylGeo, vinylMat);
    vinylBody.rotation.x = Math.PI / 2;
    vinylGroup.add(vinylBody);

    // Sticker tengah (Center Label)
    const labelGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.09, 48);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.rotation.x = Math.PI / 2;
    vinylGroup.add(labelMesh);
    labelMeshRef.current = labelMesh;

    // Lubang tengah piringan (Spindle Hole)
    const spindleHoleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.11, 24);
    const spindleHoleMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const spindleHole = new THREE.Mesh(spindleHoleGeo, spindleHoleMat);
    spindleHole.rotation.x = Math.PI / 2;
    vinylGroup.add(spindleHole);

    // 5. Tonearm (Jarum Pemutar Piringan)
    const tonearmGroup = new THREE.Group();
    tonearmGroup.position.set(3.4, 2.4, 0.4);

    // Base Pivot
    const pivotGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.4, 24);
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0x22242a, metalness: 0.9, roughness: 0.2 });
    const pivot = new THREE.Mesh(pivotGeo, pivotMat);
    pivot.rotation.x = Math.PI / 2;
    tonearmGroup.add(pivot);

    // Arm batang logam melengkung
    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-1.0, -1.2, 0.15),
      new THREE.Vector3(-1.9, -2.6, 0.05),
      new THREE.Vector3(-2.2, -3.2, -0.2),
    ]);
    const armGeo = new THREE.TubeGeometry(armCurve, 32, 0.04, 12, false);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xd4d8e2, metalness: 0.95, roughness: 0.15 });
    const arm = new THREE.Mesh(armGeo, armMat);
    tonearmGroup.add(arm);

    // Cartridge Head
    const headGeo = new THREE.BoxGeometry(0.2, 0.38, 0.16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.4, roughness: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(-2.2, -3.25, -0.2);
    tonearmGroup.add(head);

    scene.add(tonearmGroup);
    tonearmGroupRef.current = tonearmGroup;

    // 6. Partikel Spasial Melingkar di Sekitar Piringan
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.4 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 1.5;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[i * 3 + 2] = z;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(themeColor),
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Handle Resize Responsif
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Loop Animasi 60FPS
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Rotasi Piringan Hitam jika lagu sedang berputar
      if (vinylMeshRef.current && isPlaying) {
        vinylMeshRef.current.rotation.z -= 0.022; // ~33 1/3 RPM feel
      }

      // Animasi Rotasi Tonearm: mendekat ke piringan saat play, terangkat saat pause
      if (tonearmGroupRef.current) {
        const targetArmAngle = isPlaying ? 0.28 : -0.25;
        tonearmGroupRef.current.rotation.z += (targetArmAngle - tonearmGroupRef.current.rotation.z) * 0.06;
      }

      // Rotasi partikel mengambang
      if (particlesRef.current) {
        particlesRef.current.rotation.z += 0.003;
      }

      // Efek Kemiringan 3D Interaktif mengikuti Mouse (Parallax)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      if (vinylGroup) {
        vinylGroup.rotation.x = (mouseRef.current.y * 0.35) + 0.15;
        vinylGroup.rotation.y = mouseRef.current.x * 0.35;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [createVinylTexture, themeColor, isPlaying]);

  // Listener Pergerakan Mouse untuk Efek Kemiringan Spasial
  const handleMouseMove = (e) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    setIsHovered(false);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={onPlayPause}
        className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 relative cursor-pointer group transition-transform duration-500 hover:scale-[1.02]"
        title={isPlaying ? "Klik untuk jeda lagu" : "Klik untuk memutar piringan hitam"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPlayPause();
          }
        }}
        aria-label={isPlaying ? "Jeda pemutar piringan hitam" : "Putar piringan hitam"}
      >
        {/* Glow Halo di belakang piringan saat bermain */}
        <div
          className={`absolute inset-8 rounded-full blur-3xl -z-10 transition-opacity duration-1000 pointer-events-none ${
            isPlaying ? "opacity-60" : "opacity-20"
          }`}
          style={{ backgroundColor: themeColor }}
        />

        {/* Floating Play / Pause Overlay on Hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl scale-95 group-hover:scale-100 transition-transform">
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white translate-x-0.5" />
            )}
          </div>
        </div>
      </div>

      {/* Ringkas Status Piringan 3D */}
      <div className="mt-2 flex items-center gap-2.5 text-xs text-slate-300 font-mono tracking-wide">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            isPlaying ? "bg-emerald-400" : "bg-slate-500"
          }`}
        />
        <span className="font-semibold text-slate-200">
          {isPlaying ? "33 RPM Pemutaran Aktif" : "Piringan Siap"}
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">{songInfo.title}</span>
      </div>
    </div>
  );
}
