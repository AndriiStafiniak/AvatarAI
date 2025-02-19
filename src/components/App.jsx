import { Canvas } from '@react-three/fiber'
import Room from './Room'
import { Door } from './Door'
import Player from './Player' // Zakładając, że masz komponent Player

function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Pierwszy pokój */}
      <Room position={[0, 0, 0]} isFirstRoom={true} />
      
      {/* Drugi pokój */}
      <Room position={[0, 0, 10]} isFirstRoom={false} />
      
      {/* Drzwi łączące pokoje */}
      <Door />
      
      {/* Gracz */}
      <Player />
    </Canvas>
  )
}

export default App 