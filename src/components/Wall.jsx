import React from 'react'
import { useControls } from 'leva'

export const Wall = React.memo(() => {
  const { position, scale, rotation, color, opacity } = useControls('Wall', {
    position: {
      value: [0, 5, -5],
      step: 0.1,
    },
    scale: {
      value: { width: 20, height: 10 },
      step: 1,
    },
    rotation: {
      value: [0, 0, 0],
      step: 0.1,
    },
    color: {
      value: '#ffffff',
    },
    opacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.1,
    }
  })

  return (
    <mesh 
      position={position}
      rotation={rotation}
      receiveShadow
    >
      <planeGeometry args={[scale.width, scale.height]} />
      <meshStandardMaterial 
        color={color} 
        transparent
        opacity={opacity}
        side={2} // Renderuje obie strony ściany
      />
    </mesh>
  )
}) 