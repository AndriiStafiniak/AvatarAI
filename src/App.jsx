import React, { Suspense, useState, Component, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, PresentationControls, OrbitControls } from '@react-three/drei'
import { Leva } from 'leva'
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
import { RollupWithGirl } from './components/RollupWithGirl'
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
      camera={{ position: [0.5, 0.5, 3], fov: 87 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          console.error('WebGL Context Lost:', e)
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored')
            gl.setSize(gl.domElement.width, gl.domElement.height)
          }, { once: true })
        })
      }}
    >
      <OrbitControls />
      <Environment 
        preset="sunset" 
        background
        blur={0.5}
        frames={Infinity}
        resolution={256}
        backgroundIntensity={0.5}
        environmentIntensity={0.5}
      />
      
      <PresentationControls
        global
        position={[0, -0.5, 0]}
        rotation={[0, 0, 0]}
        polar={[-0.2, 0.2]}
        azimuth={[-0.3, 0.3]}
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 3, tension: 200 }}
        speed={1.5}
        zoom={1}
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
              onLoad={onAvatarLoaded}
            />
            <SceneObject currentAction={currentAction} />
            <Floor />
            <Wall />
            <Tv />
            <Zegar />
            <CoffeeTable />
            <Vase/>
            <Chair />
            <RollupWithGirl />
          </group>
        </Suspense>
      </PresentationControls>
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
            <Scene 
              isAvatarLoaded={isAvatarLoaded}
              onAvatarLoaded={handleAvatarLoaded}
              currentAction={currentAction}
            />
          </Scene3DErrorBoundary>
          {isAvatarLoaded && <ChatInterface characterId={AVATAR_ID} />}
        </div>
      </ConvaiContext.Provider>
    </div>
  )
}

export default App
