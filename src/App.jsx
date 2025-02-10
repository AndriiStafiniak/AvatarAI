import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PresentationControls } from '@react-three/drei'
import { ConvaiAvatar } from './ConvaiAvatar'
import { ChatInterface } from './components/ChatInterface'
import { Suspense, useState, Component } from 'react'
import './App.css'
import { SceneObject } from './components/SceneObject'
import { ConvaiContext } from './contexts/ConvaiContext'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Floor } from './components/Floor'
import { Wall } from './components/Wall'
import { Tv } from './components/Tv'
import { Zegar } from './components/Zegar'
import { Leva } from 'leva'

const AVATAR_ID = '881e4aac-50d5-11ef-9461-42010a7be011'

// Dodaj klasę ErrorBoundary
class Scene3DErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Scene Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div>Error loading 3D scene</div>
    }

    return this.props.children
  }
}

function App() {
  const [currentAction, setCurrentAction] = useState('');
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);

  const handleAvatarLoaded = () => {
    setIsAvatarLoaded(true);
  };

  return (
    <div className="app-container">
      <Leva hidden={false} />
      <ConvaiContext.Provider value={{ currentAction, setCurrentAction }}>
        <div className="scene-container">
          {!isAvatarLoaded && (
            <div className="loading-overlay">
              <LoadingSpinner progress={70} />
            </div>
          )}
          <Scene3DErrorBoundary>
            <Canvas 
              shadows 
              camera={{ position: [0, 0.5, 3], fov: 55 }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener('webglcontextlost', (e) => {
                  e.preventDefault();
                  console.error('WebGL Context Lost:', e);
                });
              }}
            >
              <Environment 
                preset="sunset" 
                background
                blur={0.5}
                environmentIntensity={0.5}
                backgroundIntensity={0.5}
                backgroundBlurriness={0.5}
              />
              
              <PresentationControls
                global
                position={[0, -0.5, 0]}
                rotation={[0, 0, 0]}
                polar={[0, 0.2]}
                azimuth={[-0.2, 0.2]}
                config={{ mass: 2, tension: 400 }}
                snap={{ mass: 3, tension: 200 }}
                touch-action="auto"
              >
                <ambientLight intensity={0.7} />
                <directionalLight
                  position={[5, 5, 5]}
                  intensity={0.5}
                  castShadow
                  shadow-mapSize={[1024, 1024]}
                  shadow-camera-far={25}
                  shadow-camera-near={0.1}
                  shadow-camera-top={10}
                  shadow-camera-bottom={-10}
                  shadow-camera-left={-10}
                  shadow-camera-right={10}
                />
                <Suspense fallback={null}>
                  <group position={[0, -1, 0]}>
                    <ConvaiAvatar 
                      castShadow 
                      receiveShadow 
                      onLoad={handleAvatarLoaded}
                    />
                    <SceneObject currentAction={currentAction} />
                    <Floor />
                    <Wall />
                    <Tv />
                    <Zegar />
                  </group>
                </Suspense>
              </PresentationControls>
              <OrbitControls />
            </Canvas>
          </Scene3DErrorBoundary>
          {isAvatarLoaded && <ChatInterface characterId={AVATAR_ID} />}
        </div>
      </ConvaiContext.Provider>
    </div>
  )
}

export default App
