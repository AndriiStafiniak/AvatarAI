import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useControls } from 'leva'

export const Vase = React.memo(({ 
  currentAction,
}) => {
  // Dodajemy kontrolki Leva dla wazy
  const { position, rotation, scale } = useControls('Vase', {
    position: {
      value: [1.2, 0.95, 0.7],
      step: 0.1,
    },
    rotation: {
      value: [0, Math.PI / 4, 0],
      step: 0.01,
    },
    scale: {
      value: 0.4,
      min: 0.1,
      max: 5,
      step: 0.1,
    }
  })

  const { scene: gltfScene } = useGLTF('./models/vase.glb', {
    draco: true,
    meshOptimizer: true
  })

  const clone = useMemo(() => SkeletonUtils.clone(gltfScene), [gltfScene])

  return (
    <group>
      <primitive 
        object={clone} 
        position={position}
        scale={scale}
        rotation={rotation}
      />
    </group>
  )
})

// Pre-load modelu wazy
useGLTF.preload('./models/vase.glb', {
  draco: true,
  meshOptimizer: true
}) 