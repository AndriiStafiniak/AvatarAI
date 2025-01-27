import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ConvaiAvatar } from './ConvaiAvatar'
import { ChatInterface } from './components/ChatInterface'
import { Suspense } from 'react'
import './App.css'
import { SceneObject } from './components/SceneObject'

const AVATAR_ID = '9ff38f44-437d-11ef-9187-42010a7be011'

function App() {
  return (
    <div className="scene-container">
      <Canvas 
        shadows 
        camera={{ position: [0, 1.5, 3], fov: 50 }}
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
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            <ConvaiAvatar castShadow receiveShadow />
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
      <ChatInterface characterId={AVATAR_ID} />
    </div>
  )
}

export default App
