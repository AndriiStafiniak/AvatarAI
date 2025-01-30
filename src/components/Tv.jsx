import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { Suspense } from 'react'

export function Tv() {
  const { scene } = useGLTF('./models/Tv.glb')

  const { position, rotation, scale } = useControls('TV', {
    position: {
      value: [3, 2, -4.8],
      step: 0.1,
    },
    rotation: {
      value: [0, 190, 0],
      step: 0.1,
    },
    scale: {
      value: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
    }
  })

  return (
    <Suspense fallback={null}>
      <primitive 
        object={scene} 
        position={position}
        rotation={rotation}
        scale={scale}
        castShadow
        receiveShadow
      />
    </Suspense>
  )
}

// Pre-load the model
useGLTF.preload('./models/Tv.glb') 