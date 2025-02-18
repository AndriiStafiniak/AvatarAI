import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useControls } from 'leva'
import { useBox } from '@react-three/cannon'
import { useTexture } from '@react-three/drei'

export const Door = React.memo(() => {
  const { position, rotation, scale } = useControls('Door', {
    position: {
      value: [-4.95, 1.1, 2.9],
      step: 0.1,
    },
    rotation: {
      value: [0, Math.PI/2, 0],
      step: 0.01,
    },
    scale: {
      value: 0.6,
      min: 0.1,
      max: 2,
      step: 0.1,
    }
  })

  const { scene: gltfScene } = useGLTF('./models/door.glb', {
    draco: true,
    meshOptimizer: true
  })

  const clone = useMemo(() => SkeletonUtils.clone(gltfScene), [gltfScene])

  const [ref] = useBox(() => ({
    type: 'Static',
    args: [1, 2.2, 0.1],
    position: [-4.95, 1.1, -1.5],
    material: { friction: 0.5 }
  }))

  return (
    <group>
      <primitive 
        object={clone} 
        position={position}
        rotation={rotation}
        scale={scale}
      />
      <mesh ref={ref} visible={false}>
        <boxGeometry args={[1, 2.2, 0.1]} />
      </mesh>
    </group>
  )
})

// Pre-load modelu
useGLTF.preload('./models/door.glb', {
  draco: true,
  meshOptimizer: true
})

