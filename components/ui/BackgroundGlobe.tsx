import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const BackgroundGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    
    // Adjusted Fog: Start further away so it doesn't grey out the earth
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 22; 
    camera.position.y = 5; 
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    // Minimal Ambient Light to keep shadows PURE BLACK
    const ambientLight = new THREE.AmbientLight(0x000000); 
    scene.add(ambientLight);

    // Strong Sun/Rim Light
    const sunLight = new THREE.DirectionalLight(0x06b6d4, 3.0); // Cyan Tint
    sunLight.position.set(-10, 5, 20);
    scene.add(sunLight);

    // Back Rim for separation
    const backLight = new THREE.SpotLight(0x22d3ee, 5.0);
    backLight.position.set(15, 0, -10);
    backLight.lookAt(0, 0, 0);
    scene.add(backLight);

    // --- Texture Loader ---
    const textureLoader = new THREE.TextureLoader();
    const earthLightsTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png');
    const earthBumpTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const earthCloudsTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');

    // --- Groups ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- 0. Procedural Atmosphere Glow (Sprite) ---
    // Create a soft glow texture programmatically
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)'); // Inner Color (Cyan)
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)'); // Mid
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Outer
        context.fillStyle = gradient;
        context.fillRect(0, 0, 128, 128);
    }
    const glowTexture = new THREE.CanvasTexture(canvas);
    const glowMaterial = new THREE.SpriteMaterial({ 
        map: glowTexture, 
        color: 0x22d3ee, 
        transparent: true, 
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(35, 35, 1); // Larger than earth
    scene.add(glowSprite); // Add to scene, not group, so it doesn't rotate with earth


    // --- 1. HD Earth Surface ---
    const earthGeometry = new THREE.SphereGeometry(10, 128, 128);
    
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: null,
      color: 0x000000, // PURE BLACK for oceans (Fixes the grey look)
      emissive: 0x0891b2, // Cyan tint for the lights
      emissiveMap: earthLightsTexture,
      emissiveIntensity: 1.5, // High intensity for lights
      normalMap: earthBumpTexture,
      normalScale: new THREE.Vector2(3, 3), // Stronger terrain depth
      specular: 0x000000, // No reflection on land/ocean base to keep it dark
      shininess: 0,
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    mainGroup.add(earth);

    // --- 2. Cloud Layer ---
    const cloudGeometry = new THREE.SphereGeometry(10.1, 128, 128);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: earthCloudsTexture,
      transparent: true,
      opacity: 0.15, // Reduced opacity so it doesn't wash out the black
      blending: THREE.AdditiveBlending, // Glows instead of blocking
      side: THREE.DoubleSide
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    mainGroup.add(cloudMesh);

    // --- 3. Digital Grid (Subtle) ---
    const gridGeometry = new THREE.IcosahedronGeometry(10.2, 2);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee, 
      wireframe: true,
      transparent: true,
      opacity: 0.05, // Very subtle
      blending: THREE.AdditiveBlending
    });
    const gridGlobe = new THREE.Mesh(gridGeometry, gridMaterial);
    mainGroup.add(gridGlobe);

    // --- 4. Particles (Stars) ---
    const particlesGeom = new THREE.BufferGeometry();
    const particleCount = 800;
    const particlePositions = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount; i++) {
        const r = 20 + Math.random() * 60; 
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        particlePositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i*3+2] = r * Math.cos(phi);
    }
    
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
    });
    const starField = new THREE.Points(particlesGeom, particlesMat);
    scene.add(starField);


    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);

      // Earth Rotation
      earth.rotation.y += 0.0005;
      cloudMesh.rotation.y += 0.0007;
      gridGlobe.rotation.y -= 0.0002;
      
      // Starfield drift
      starField.rotation.y -= 0.0001;

      // Subtle pulse of glow
      glowSprite.material.opacity = 0.5 + Math.sin(Date.now() * 0.001) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
