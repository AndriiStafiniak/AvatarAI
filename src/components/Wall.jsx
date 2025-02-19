import React from 'react'
import { useBox } from '@react-three/cannon'

export function Wall({ position, args, color, ...props }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    args: args,
    position: position,
    material: { friction: 0.5 },
    ...props
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
} 