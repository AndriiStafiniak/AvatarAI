import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export function SceneObject({ actions, objects, currentAction }) {
  // Removed useThree as it's not being used
  
  // Upewnij się że props są zdefiniowane
  const safeObjects = objects || []
  const safeCurrentAction = currentAction || ''
  
  const { scene: gltfScene } = useGLTF('/reception_desk.glb')
  const clone = useMemo(() => SkeletonUtils.clone(gltfScene), [gltfScene])

  return (
    <group>
      <primitive 
        object={clone} 
        position={[0, 0, 0.7]} // Pozycja przed awatarem
        scale={1.1} // Możesz dostosować skalę
        rotation={[0, Math.PI * 2, 0]} // Obrót o 180 stopni, aby obiekt był zwrócony w stronę kamery
      />
    </group>
  )
}

useGLTF.preload('/reception_desk.glb') 