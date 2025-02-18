import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Office(props) {
  const { scene } = useGLTF('/models/elevator.glb')
  return <primitive 
    {...props} 
    object={scene} 
    position={[-13, 0, 0]} 
    rotation={[0, Math.PI / 2, 0]} 
    scale={0.5} 
  />
}

useGLTF.preload('/models/elevator.glb') 