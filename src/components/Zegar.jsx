import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { Suspense } from 'react'

export function Zegar() {
  const { scene } = useGLTF('./models/Zegar.glb')
  console.log(scene)

  const { position, rotationY, scale } = useControls('Zegar', {
    position: {
      value: [-0.5, 2, -4.9],
      step: 0.1,
    },
    rotationY: {
     value: 187, min: 0, max: 360, step: 1 
    },
    scale: {
      value: 3,
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
        rotation={[0, rotationY, 0]}
        scale={scale}
        castShadow
        receiveShadow
      />
    </Suspense>
  )
}

// Pre-load the model
useGLTF.preload('./models/Zegar.glb') 