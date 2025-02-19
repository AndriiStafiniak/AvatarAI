import React from 'react'
import { useControls } from 'leva'
import { useBox } from '@react-three/cannon'

export function Floor(props) {
  const controls = useControls('Floor', {
    position: { value: [0, 0.1, 0], label: 'Position' },
    size: { value: [100, 0.1, 100], label: 'Size' },
    color: { value: '#808080', label: 'Color' }
  })

  const [ref] = useBox(() => ({
    type: 'Static',
    args: [100, 0.1, 100],
    position: controls.position,
    material: {
      friction: 0.5,
      restitution: 0.3
    },
    ...props
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={controls.size} />
      <meshStandardMaterial color={controls.color} />
    </mesh>
  )
} 