import React from 'react'
import { useControls } from 'leva'
import { useBox } from '@react-three/cannon'

export function Floor(props) {
  const [ref] = useBox(() => ({
    type: 'Static',
    args: [10, 0.1, 10],
    position: [0, -0.1, 0],
    material: {
      friction: 0.5,
      restitution: 0.3
    },
    ...props
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[10, 0.1, 10]} />
      <meshStandardMaterial color="#808080" />
    </mesh>
  )
} 