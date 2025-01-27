import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Model } from './Avatar'
import './App.css'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
        <OrbitControls />
        <Model position={[0, 0, 0]} />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  )
}

export default App
