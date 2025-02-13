import React, { useMemo } from 'react'
import { useControls } from 'leva'
import * as THREE from 'three'

export const Wall = React.memo(() => {
  const { position, scale, rotation, colorType, color1, color2, opacity } = useControls('Wall', {
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
    colorType: {
      value: 'gradient-horizontal',
      options: {
        'Jednolity': 'solid',
        'Gradient poziomy': 'gradient-horizontal',
        'Gradient pionowy': 'gradient-vertical',
        'Losowe kolory': 'random'
      }
    },
    color1: {
      value: '#dcffe7',
      hidden: ({ colorType }) => colorType === 'solid'
    },
    color2: {
      value: '#3a2c2c',
      hidden: ({ colorType }) => colorType !== 'gradient-horizontal' && colorType !== 'gradient-vertical'
    },
    opacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.1,
    }
  })

  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(scale.width, scale.height)
    const colors = []
    
    const colorA = new THREE.Color(color1)
    const colorB = new THREE.Color(color2)
    
    for (let i = 0; i < geom.attributes.position.count; i++) {
      let color
      switch(colorType) {
        case 'gradient-horizontal':
          const x = (geom.attributes.position.getX(i) + scale.width/2) / scale.width
          color = colorA.clone().lerp(colorB, x)
          break
        case 'gradient-vertical':
          const y = (geom.attributes.position.getY(i) + scale.height/2) / scale.height
          color = colorA.clone().lerp(colorB, y)
          break
        case 'random':
          color = new THREE.Color().setHSL(Math.random(), 0.5, 0.5)
          break
        default: // solid
          color = colorA
      }
      colors.push(color.r, color.g, color.b)
    }
    
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geom
  }, [scale, colorType, color1, color2])

  return (
    <mesh 
      position={position}
      rotation={rotation}
      receiveShadow
      geometry={geometry}
    >
      <meshPhongMaterial 
        vertexColors
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}) 