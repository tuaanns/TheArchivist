/* eslint-disable react-hooks/exhaustive-deps */
import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  useGLTF,
  useFBX,
  Center,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Camera } from 'lucide-react';

// ModelViewer — stable 3D model viewer, optimized to prevent flicker/jump

// Model component with stable rendering
const Model = ({
  url,
  modelXOffset = 0,
  modelYOffset = 0,
  autoRotate = false,
  autoRotateSpeed = 0.35,
}) => {
  const modelRef = useRef();
  const groupRef = useRef();
  const { camera, scene: threeScene } = useThree();
  const hasFramedRef = useRef(false); // Prevent multiple camera fits

  // Set scene background color
  useEffect(() => {
    // Check if dark mode
    const isDark = document.documentElement.classList.contains('dark');
    threeScene.background = new THREE.Color(isDark ? '#1e293b' : '#faf9f7');

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      threeScene.background = new THREE.Color(isDark ? '#1e293b' : '#faf9f7');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [threeScene]);

  // Determine file type - handle query params
  const fileExtension = url.split('.').pop().split('?')[0].toLowerCase();

  // Load model based on file type
  let scene = null;
  const [objScene, setObjScene] = useState(null);

  try {
    if (fileExtension === 'glb' || fileExtension === 'gltf') {
      const { scene: gltfScene } = useGLTF(url);
      scene = gltfScene;
    } else if (fileExtension === 'fbx') {
      scene = useFBX(url);
    }
  } catch (error) {
    console.error('Error loading model:', error);
  }

  // Load OBJ separately (can't use hooks conditionally)
  useEffect(() => {
    if (fileExtension === 'obj') {
      const loader = new OBJLoader();
      loader.load(
        url,
        (obj) => setObjScene(obj),
        undefined,
        (error) => console.error('Error loading OBJ:', error)
      );
    }
  }, [url, fileExtension]);

  // Use OBJ scene if loaded
  if (fileExtension === 'obj' && objScene) {
    scene = objScene;
  }

  // One-time camera fit after model loads
  useEffect(() => {
    if (!scene || hasFramedRef.current) return;

    const timer = setTimeout(() => {
      if (!modelRef.current || hasFramedRef.current) return;

      try {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(modelRef.current);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Calculate optimal camera distance
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Add some padding

        // Set camera position
        camera.position.set(center.x, center.y, center.z + cameraZ);
        camera.lookAt(center);
        camera.updateProjectionMatrix();

        hasFramedRef.current = true;
      } catch (e) {
        console.warn('Could not auto-fit model:', e);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [scene, camera]);

  // Animation frame - only for auto-rotation
  useFrame((state, delta) => {
    if (!groupRef.current || !autoRotate) return;
    groupRef.current.rotation.y += delta * autoRotateSpeed;
  });

  if (!scene) {
    return null;
  }

  return (
    <group ref={groupRef} position={[modelXOffset, modelYOffset, 0]}>
      <Center scale={3.5}>
        <primitive ref={modelRef} object={scene.clone()} />
      </Center>
    </group>
  );
};

// Loading component
const Loader = () => (
  <Html center>
    <div className="flex flex-col items-center gap-2">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent dark:border-ivory dark:border-t-transparent" />
      <p className="text-sm font-semibold text-navy dark:text-ivory">Loading 3D Model...</p>
    </div>
  </Html>
);

// Error boundary component
const ErrorFallback = ({ error }) => (
  <Html center>
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-6 shadow-lg dark:bg-dark-surface">
      <p className="text-sm font-semibold text-danger">Failed to load model</p>
      <p className="text-xs text-muted dark:text-dark-text-muted">{error?.message || 'Unknown error'}</p>
    </div>
  </Html>
);

// Main ModelViewer component
const ModelViewer = ({
  url,
  width = 600,
  height = 600,
  modelXOffset = 0,
  modelYOffset = 0,
  environmentPreset = 'sunset',
  autoRotate = false,
  autoRotateSpeed = 0.35,
  showScreenshotButton = false,
  className = '',
  t, // i18n translation function (optional)
}) => {
  const canvasRef = useRef();
  const [error, setError] = useState(null);

  const handleScreenshot = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `model-screenshot-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  };

  // Stable canvas with smooth auto-rotation
  const canvasElement = useMemo(() => (
    <Canvas
      ref={canvasRef}
      shadows
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: false,
      }}
      frameloop="always" // Always render for smooth auto-rotation
    >
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Environment */}
      <Environment preset={environmentPreset} />

      {/* Model - no Bounds wrapper to prevent refit */}
      <Suspense fallback={<Loader />}>
        {error ? (
          <ErrorFallback error={error} />
        ) : (
          <Model
            url={url}
            modelXOffset={modelXOffset}
            modelYOffset={modelYOffset}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
          />
        )}
      </Suspense>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={1.2}
        maxDistance={12}
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  ), [
    url,
    modelXOffset,
    modelYOffset,
    environmentPreset,
    autoRotate,
    autoRotateSpeed,
    error,
  ]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-surface shadow-lg dark:bg-dark-surface ${className}`}
      style={{ width, height }}
    >
      {canvasElement}

      {/* Screenshot button */}
      {showScreenshotButton && (
        <button
          onClick={handleScreenshot}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-navy/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-navy hover:shadow-xl active:scale-95 dark:bg-ivory/90 dark:text-navy dark:hover:bg-ivory"
          aria-label={t?.('home.3d.screenshot') || 'Take screenshot'}
        >
          <Camera size={16} />
          <span className="hidden sm:inline">{t?.('home.3d.screenshot') || 'Screenshot'}</span>
        </button>
      )}
    </div>
  );
};

// Preload models for better performance
ModelViewer.preload = (url) => {
  const fileExtension = url.split('.').pop().split('?')[0].toLowerCase();
  if (fileExtension === 'glb' || fileExtension === 'gltf') {
    useGLTF.preload(url);
  } else if (fileExtension === 'fbx') {
    useFBX.preload(url);
  }
};

export default ModelViewer;

