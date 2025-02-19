import React, { Suspense, useState, Component, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, PresentationControls, OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { ConvaiContext } from './contexts/ConvaiContext'
import { LoadingSpinner } from './components/LoadingSpinner'
// Importujemy komponenty bezpośrednio zamiast lazy loading
import { ConvaiAvatar } from './ConvaiAvatar'
import { ChatInterface } from './components/ChatInterface'
import { Floor } from './components/Floor'
import { Wall } from './components/Wall'
import { Tv } from './components/Tv'
import { Zegar } from './components/Zegar'
import { SceneObject } from './components/SceneObject'
import { Vase } from './components/Vase'
import './App.css'
import { Chair } from './components/Chair'
import { CoffeeTable } from './components/CoffeeTable'
import { Rollup } from './components/Rollup'
import { KeyboardControls } from '@react-three/drei'
import { FPVCamera } from './components/FPVCamera'
import { Physics } from '@react-three/cannon'
import { Ceiling } from './components/Ceiling'


const AVATAR_ID = 'fe2da934-6aa4-11ef-8fba-42010a7be011'

// Optymalizacja ErrorBoundary z lepszą obsługą błędów
class Scene3DErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorDetails: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Scene Error:', error, errorInfo)
    this.setState({ errorDetails: error.message })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Error loading 3D scene</h2>
          <p>{this.state.errorDetails}</p>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Optymalizacja głównego komponentu sceny
const Scene = React.memo(({ isAvatarLoaded, onAvatarLoaded, currentAction }) => {
  return (
    <Canvas 
      shadows 
      camera={{ 
        position: [0, 1.5, 3],  // X: 0, Y: 1.5m (wysokość osoby), Z: 3m od przodu
        fov: 75,                // Naturalne pole widzenia
        rotation: [0, Math.PI, 0] // Patrzymy w kierunku ujemnej osi Z
      }}
      onCreated={({ gl, camera }) => {
        gl.domElement.style.touchAction = 'none'
        camera.lookAt(0, 1, 0)  // Celujemy na wysokości 1m (środek awatara)
      }}
    >
      {/* <OrbitControls /> */}
      <Physics gravity={[0, -9.81, 0]}>
        <FPVCamera 
          speed={5} 
          sensitivity={0.0020}
        />
        <Environment 
          preset="sunset" 
          background
          blur={0.5}
          frames={Infinity}
          resolution={256}
          backgroundIntensity={0.5}
          environmentIntensity={0.5}
        />
        
        {/* <PresentationControls
          global
          position={[0, -0.5, 0]}
          rotation={[0, 0, 0]}
          polar={[-0.2, 0.2]}
          azimuth={[-0.3, 0.3]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 3, tension: 200 }}
          speed={1.5}
          zoom={1}
        > */}
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
                onLoad={onAvatarLoaded}
              />
              <SceneObject currentAction={currentAction} />
              <Floor />
              <Ceiling />
              <Tv />
              <Zegar />
              <CoffeeTable />
              <Vase/>
              <Chair />
              <Rollup />
              <Wall
                name="Left Wall"
                initialPosition={[-50, 2, 0]}
                initialSize={[1, 4, 100]}
                initialColor="#a0a0a0"
              />
              <Wall
                name="Right Wall"
                initialPosition={[50, 2, 0]}
                initialSize={[1, 4, 100]}
                initialColor="#a0a0a0"
              />
              <Wall
                name="Back Wall"
                initialPosition={[0, 2, -50]}
                initialSize={[100, 4, 1]}
                initialColor="#a0a0a0"
              />
              <Wall
                name="Front Wall"
                initialPosition={[0, 2, 50]}
                initialSize={[100, 4, 1]}
                initialColor="#909090"
              />
              <Wall
                name="Inside Left Wall"
                initialPosition={[-15, 2, 0]}
                initialSize={[0.5, 4, 20]}
                initialColor="#c0c0c0"
              />
              <Wall
                name="Inside Right Wall"
                initialPosition={[15, 2, 0]}
                initialSize={[0.5, 4, 20]}
                initialColor="#c0c0c0"
              />
              <Wall
                name="Inside Back Wall"
                initialPosition={[5, 2, -2.6]}
                initialSize={[20, 4, 0.5]}
                initialColor="#616161"
              />
              <group position={[0, 0, 15]}>
                <Wall
                  name="Inside Front Wall Left"
                  initialPosition={[-7.5, 2, 0]}
                  initialSize={[5, 4, 0.5]}
                  initialColor="#c0c0c0"
                />
                <Wall
                  name="Inside Front Wall Right"
                  initialPosition={[7.5, 2, 0]}
                  initialSize={[5, 4, 0.5]}
                  initialColor="#c0c0c0"
                />
              </group>
              <group position={[0, 0, -30]}>
                <Wall
                  name="Partition Wall 1"
                  initialPosition={[-10, 2, 0]}
                  initialSize={[0.5, 4, 10]}
                  initialColor="#d0d0d0"
                />
                <Wall
                  name="Partition Wall 2"
                  initialPosition={[10, 2, 0]}
                  initialSize={[0.5, 4, 10]}
                  initialColor="#d0d0d0"
                />
              </group>
              <group position={[25, 0, 20]}>
                <Wall
                  name="Partition Wall 3 Left"
                  initialPosition={[-3, 2, 0]}
                  initialSize={[4, 4, 0.5]}
                  initialColor="#e0e0e0"
                />
                <Wall
                  name="Partition Wall 3 Right"
                  initialPosition={[3, 2, 0]}
                  initialSize={[4, 4, 0.5]}
                  initialColor="#e0e0e0"
                />
              </group>
              <group position={[-20, 0, 25]}>
                <Wall
                  name="Corner Partition 1"
                  initialPosition={[0, 2, 0]}
                  initialSize={[0.5, 4, 8]}
                  initialColor="#b0b0b0"
                  rotation={[0, Math.PI/4, 0]}
                />
                <Wall
                  name="Corner Partition 2"
                  initialPosition={[0, 2, 0]}
                  initialSize={[0.5, 4, 8]}
                  initialColor="#b0b0b0"
                  rotation={[0, -Math.PI/4, 0]}
                />
              </group>
            </group>
          </Suspense>
        {/* </PresentationControls> */}
      </Physics>
    </Canvas>
  )
}, (prevProps, nextProps) => {
  return prevProps.isAvatarLoaded === nextProps.isAvatarLoaded &&
         prevProps.currentAction === nextProps.currentAction
})

const App = () => {
  const [currentAction, setCurrentAction] = useState('')
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false)

  const handleAvatarLoaded = useCallback(() => {
    setIsAvatarLoaded(true)
  }, [])

  return (
    <div className="app-container" style={{ 
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0 
    }}>
      <Leva hidden={true} />
      <ConvaiContext.Provider value={{ currentAction, setCurrentAction }}>
        <KeyboardControls
          map={[
            { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
            { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
            { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
            { name: 'right', keys: ['ArrowRight', 'KeyD'] },
          ]}
        >
          <div className="scene-container">
            {!isAvatarLoaded && (
              <div className="loading-overlay">
                <LoadingSpinner progress={70} />
              </div>
            )}
            <Scene3DErrorBoundary>
              <Scene 
                isAvatarLoaded={isAvatarLoaded}
                onAvatarLoaded={handleAvatarLoaded}
                currentAction={currentAction}
              />
            </Scene3DErrorBoundary>
            {isAvatarLoaded && <ChatInterface characterId={AVATAR_ID} />}
          </div>
        </KeyboardControls>
      </ConvaiContext.Provider>
    </div>
  )
}

export default App
