import React, { Suspense, useState, Component, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, PresentationControls, OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { ConvaiContext } from './contexts/ConvaiContext'
import { LoadingSpinner } from './components/LoadingSpinner'
// Importujemy komponenty bezpośrednio zamiast lazy loading
import { ConvaiAvatar, ConvaiAvatar2, ConvaiAvatar3, ConvaiAvatar4 } from './ConvaiAvatar'
import { ChatInterface } from './components/ChatInterface'
import { Floor } from './components/Floor'
import { Wall } from './components/Wall'
import { Tv } from './components/Tv'
import { Zegar } from './components/Zegar'
import { ReceptionDesk } from './components/ReceptionDesk'
import { Vase } from './components/Vase'
import './App.css'
import { Chair } from './components/Chair'
import { CoffeeTable } from './components/CoffeeTable'
import { Rollup } from './components/Rollup'
import { KeyboardControls } from '@react-three/drei'
import { FPVCamera } from './components/FPVCamera'
import { Physics } from '@react-three/cannon'
import  Ceiling from './components/Ceiling'
import { useCylinder } from '@react-three/cannon'


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

// Nowy komponent opakowujący awatar z fizyką
const AvatarWithPhysics = ({ children, onLoad, position, rotation }) => {
  const [ref] = useCylinder(() => ({
    mass: 0, // Mass 0 = obiekt statyczny
    position,
    rotation,
    args: [0.3, 0.3, 1.8, 16], // [radiusTop, radiusBottom, height, numSegments]
    material: {
      friction: 0.1,
      restitution: 0.2,
    },
  }))

  return (
    <group ref={ref} position={position} rotation={rotation}>
      {React.cloneElement(children, { onLoad })}
    </group>
  )
}

// Optymalizacja głównego komponentu sceny
const Scene = React.memo(({ isAvatarLoaded, onAvatarLoaded, currentAction }) => {
  // Stały układ losowy wygenerowany raz na zawsze
  const initialPositions = {
    insideLeft: [-15.2, 2, 8.7],
    insideRight: [18.9, 2, -5.3],
    frontLeft: [-7.5, 2, 22.4],
    frontRight: [9.1, 2, 18.6],
    partition1: [-28.5, 2, -15.8],
    partition2: [32.1, 2, -25.3],
    partition3Left: [19.7, 2, 24.9],
    partition3Right: [30.4, 2, 17.2],
    corner1: [-22.3, 2, 19.8],
    corner2: [-18.6, 2, 27.4]
  };

  return (
    <Canvas 
      shadows 
      style={{ background: '#474747' }}
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
        {/* <Environment 
          preset="night" 
          background
          blur={0.5}
          frames={Infinity}
          resolution={256}
          backgroundIntensity={0.8}
          environmentIntensity={0.8}
        /> */}
        
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
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.3} color="#ffccaa" />
          <Suspense fallback={null}>
            <group position={[0, -1, 0]}>
              <AvatarWithPhysics 
                position={[0, 0, 0]}
                rotation={[0, -Math.PI * 0, 0]}
                onLoad={onAvatarLoaded}
              >
                <ConvaiAvatar castShadow receiveShadow />
              </AvatarWithPhysics>

              <AvatarWithPhysics 
                position={[-14, 0, 9]}
                rotation={[0, Math.PI * 0.5, 0]}
              >
                <ConvaiAvatar2 castShadow receiveShadow />
              </AvatarWithPhysics>

              <AvatarWithPhysics 
                position={[-8, 0, 21]}
                rotation={[0, -Math.PI, 0]}
              >
                <ConvaiAvatar3 castShadow receiveShadow />
              </AvatarWithPhysics>

              <AvatarWithPhysics 
                position={[8, 0, 17]}
                rotation={[0, Math.PI, 0]}
              >
                <ConvaiAvatar4 castShadow receiveShadow />
              </AvatarWithPhysics>
              <ReceptionDesk
                currentAction={currentAction}
                position={[0, 0, 0]}
                rotation={[0, Math.PI * 0, 0]}
                scale={1.1}
              />
              <ReceptionDesk
                currentAction={currentAction}
                position={[-14, 0, 9]}
                rotation={[0, Math.PI * 0.5, 0]}
                scale={1.1}
              />
              <ReceptionDesk
                currentAction={currentAction}
                position={[-8, 0, 21]}
                rotation={[0, -Math.PI, 0]}
                scale={1.1}
              />
              <ReceptionDesk
                currentAction={currentAction}
                position={[8, 0, 17]}
                rotation={[0, Math.PI, 0]}
                scale={1.1}
              />
              <Floor />
              <Ceiling />
              <Tv />
              <Zegar />
              <CoffeeTable />
              <Vase/>
              <Chair />
              {/* <Rollup /> */}
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
                initialPosition={initialPositions.insideLeft}
                initialSize={[0.5, 4, 20]}
                initialColor="#2d3843"
              />
              <Wall
                name="Inside Right Wall"
                initialPosition={initialPositions.insideRight}
                initialSize={[0.5, 4, 20]}
                initialColor="#3a4b5c"
              />
              <Wall
                name="Inside Front Wall Left"
                initialPosition={initialPositions.frontLeft}
                initialSize={[5, 4, 0.5]}
                initialColor="#34495e"
              />
              <Wall
                name="Inside Front Wall Right"
                initialPosition={initialPositions.frontRight}
                initialSize={[5, 4, 0.5]}
                initialColor="#2c3e50"
              />
              <Wall
                name="Partition Wall 1"
                initialPosition={initialPositions.partition1}
                initialSize={[0.5, 4, 10]}
                initialColor="#465362"
              />
              <Wall
                name="Partition Wall 2"
                initialPosition={initialPositions.partition2}
                initialSize={[0.5, 4, 10]}
                initialColor="#3d5467"
              />
              <Wall
                name="Partition Wall 3 Left"
                initialPosition={initialPositions.partition3Left}
                initialSize={[4, 4, 0.5]}
                initialColor="#354052"
              />
              <Wall
                name="Partition Wall 3 Right"
                initialPosition={initialPositions.partition3Right}
                initialSize={[4, 4, 0.5]}
                initialColor="#2d3646"
              />
              <Wall
                name="Corner Partition 1"
                initialPosition={initialPositions.corner1}
                initialSize={[0.5, 4, 8]}
                initialColor="#3a4556"
                rotation={[0, Math.PI/4, 0]}
              />
              <Wall
                name="Corner Partition 2"
                initialPosition={initialPositions.corner2}
                initialSize={[0.5, 4, 8]}
                initialColor="#333d4d"
                rotation={[0, -Math.PI/4, 0]}
              />
              <Wall
                name="Inside Back Wall"
                initialPosition={[5, 2, -2.6]}
                initialSize={[20, 4, 0.5]}
                initialColor="#404040"
              />
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
      <Leva hidden={false} />
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
