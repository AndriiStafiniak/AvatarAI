import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useControls } from 'leva'

export const RollupWithGirl = React.memo(() => {
  // Kontrolki Leva dla rollupu z dziewczyną
  const { position, rotation, scale } = useControls('Rollup with Girl', {
    position: {
      value: [-1.7, 0, 0.7],
      step: 0.1,
    },
    rotation: {
      value: [0, Math.PI * 0.3, 0],
      step: 0.01,
    },
    scale: {
      value: 1,
      min: 0.1,
      max: 2,
      step: 0.1,
    }
  })

  const { scene: gltfScene } = useGLTF('./models/rollupWithGirl1.glb', {
    draco: true,
    meshOptimizer: true
  })

  const clone = useMemo(() => SkeletonUtils.clone(gltfScene), [gltfScene])

  return (
    <group>
      <primitive 
        object={clone} 
        position={position}
        rotation={rotation}
        scale={scale}
      />
    </group>
  )
})

// Pre-load modelu
useGLTF.preload('./models/rollupWithGirl1.glb', {
  draco: true,
  meshOptimizer: true
}) 