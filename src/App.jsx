import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ConvaiAvatar } from './ConvaiAvatar'
import { ChatInterface } from './components/ChatInterface'
import { Suspense, useState } from 'react'
import './App.css'
import { SceneObject } from './components/SceneObject'
import { ConvaiContext } from './contexts/ConvaiContext'
import { LoadingSpinner } from './components/LoadingSpinner'

const AVATAR_ID = '9ff38f44-437d-11ef-9187-42010a7be011'

function App() {
  const [currentAction, setCurrentAction] = useState('');
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);

  const handleAvatarLoaded = () => {
    setIsAvatarLoaded(true);
  };

  return (
    <div className="app-container">
      <ConvaiContext.Provider value={{ currentAction, setCurrentAction }}>
        <div className="scene-container">
          {!isAvatarLoaded && (
            <div className="loading-overlay">
              <LoadingSpinner progress={70} />
            </div>
          )}
          <Canvas 
            shadows 
            camera={{ position: [0, 1.5, 3], fov: 50 }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                console.error('WebGL Context Lost:', e);
              });
            }}
          >
            <color attach="background" args={['#808080']} />
            
            {/* Światła */}
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.5}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-far={20}
              shadow-camera-near={0.1}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
              shadow-camera-left={-10}
              shadow-camera-right={10}
            />
            
            {/* Kontrolki */}
            <OrbitControls />
            
            {/* Avatar i cienie */}
            <Suspense>
              <group position={[0, -1, 0]}>
                <ConvaiAvatar 
                  castShadow 
                  receiveShadow 
                  onLoad={handleAvatarLoaded}
                />
                <SceneObject currentAction={currentAction} />
                <mesh 
                  rotation-x={-Math.PI / 2} 
                  position={[0, 0, 0]} 
                  receiveShadow
                >
                  <planeGeometry args={[20, 20]} />
                  <shadowMaterial opacity={0.2} />
                </mesh>
              </group>
            </Suspense>
          </Canvas>
          {isAvatarLoaded && <ChatInterface characterId={AVATAR_ID} />}
        </div>
      </ConvaiContext.Provider>
    </div>
  )
}

export default App
