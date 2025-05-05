import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AlertTriangle, Loader } from 'lucide-react';
import * as THREE from 'three';

interface ProductViewerProps {
  modelUrl: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

function Model({ modelUrl, autoRotate = true }: { modelUrl: string; autoRotate?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Load the model with error handling
  let gltf;
  try {
    gltf = useLoader(GLTFLoader, modelUrl, undefined, (error) => {
      setError(error.message);
    });
  } catch (err) {
    return null;
  }

  useEffect(() => {
    if (gltf) {
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      
      gltf.scene.scale.setScalar(scale);
      gltf.scene.position.sub(center.multiplyScalar(scale));
      
      // Position camera to fit model
      const distance = 4;
      camera.position.set(distance, distance / 2, distance);
      camera.lookAt(0, 0, 0);
    }
  }, [gltf, camera]);

  // Slowly rotate the model if autoRotate is enabled
  useFrame((state, delta) => {
    if (modelRef.current && autoRotate) {
      modelRef.current.rotation.y += delta * 0.5;
    }
  });

  if (error) {
    return null;
  }

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      position={[0, 0, 0]}
    />
  );
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    </Html>
  );
}

function ErrorFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">3D model could not be loaded</p>
      </div>
    </div>
  );
}

const ProductViewer = ({ modelUrl, autoRotate = true, showControls = true }: ProductViewerProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <div className="model-viewer relative rounded-lg overflow-hidden bg-gradient-to-b from-gray-50 to-white" style={{ height: '400px' }}>
      <Canvas
        onError={() => setHasError(true)}
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true }}
        shadows
      >
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={<LoadingSpinner />}>
          <Model modelUrl={modelUrl} autoRotate={autoRotate} />
          <Environment preset="studio" />
        </Suspense>
        
        {showControls && (
          <OrbitControls 
            enablePan={false}
            minDistance={2}
            maxDistance={7}
            enableDamping
            dampingFactor={0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
          />
        )}
      </Canvas>

      {/* Gradient overlay for depth effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent to-white/10"></div>
      
      {/* Controls hint */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
          Click and drag to rotate • Scroll to zoom
        </div>
      )}
    </div>
  );
};

export default ProductViewer;