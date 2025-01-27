import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export function SceneObject(props) {
  const { scene } = useGLTF('/reception_desk.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

  return (
    <primitive 
      object={clone} 
      position={[0, 0, 0.7]} // Pozycja przed awatarem
      scale={1.1} // Możesz dostosować skalę
      rotation={[0, Math.PI * 2, 0]} // Obrót o 180 stopni, aby obiekt był zwrócony w stronę kamery
      {...props}
    />
  )
}

useGLTF.preload('/668f906e7a0772243ce94e20.glb') 