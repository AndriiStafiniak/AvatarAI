import React from 'react'
import { useControls } from 'leva'

export const Floor = React.memo(() => {
  const { position, scale, color, opacity } = useControls('Floor', {
    position: {
      value: [0, 0, 0],
      step: 0.1,
    },
    scale: {
      value: 20,
      min: 1,
      max: 100,
      step: 1,
    },
    color: {
      value: '#808080',
    },
    opacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.1,
    },
  })

  return (
    <mesh 
      rotation-x={-Math.PI / 2} 
      position={position} 
      receiveShadow
    >
      <planeGeometry args={[scale, scale]} />
      <meshStandardMaterial 
        color={color} 
        transparent
        opacity={opacity}
      />
    </mesh>
  )
}) 