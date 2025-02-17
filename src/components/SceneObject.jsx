import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export const SceneObject = React.memo(({ currentAction }) => {
  const { scene: gltfScene } = useGLTF('./models/resize_reception.glb', {
    draco: true,
    meshOptimizer: true
  })

  const clone = useMemo(() => SkeletonUtils.clone(gltfScene), [gltfScene])

  return (
    <group>
      <primitive 
        object={clone} 
        position={[0, 0, 0.7]}
        scale={1.1}
        rotation={[0, Math.PI * 2, 0]}
      />
    </group>
  )
})

// Pre-load modelu z optymalizacjami
useGLTF.preload('./models/resize_reception.glb', {
  draco: true,
  meshOptimizer: true
}) 