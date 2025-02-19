import React from 'react'
import { useBox } from '@react-three/cannon'

export function Floor({ position = [0, -0.001, 0], args = [100, 0.001, 100], color = '#808080', ...props }) {
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