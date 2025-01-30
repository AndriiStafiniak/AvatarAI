import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { Suspense, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Zegar() {
  const { scene } = useGLTF('./models/Zegar.glb')
  const secondHand = useRef()
  const minuteHand = useRef()
  const hourHand = useRef()

  // Znajdź wskazówki w modelu
  useEffect(() => {
    secondHand.current = scene.getObjectByName('sekundy')
    minuteHand.current = scene.getObjectByName('Minuty')
    hourHand.current = scene.getObjectByName('Godziny')

    if (secondHand.current) {
      secondHand.current.visible = true
      secondHand.current.renderOrder = 1
    }
  }, [scene])

  // Animuj wskazówki
  useFrame(() => {
    const now = new Date()
    const seconds = now.getSeconds()
    const minutes = now.getMinutes()
    const hours = now.getHours()

    // Obliczamy kąty tak jak w przykładzie HTML
    const secondDegrees = (seconds / 60) * 360
    const minuteDegrees = ((minutes + seconds / 60) / 60) * 360
    const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360

    // Konwertujemy stopnie na radiany i dodajemy offset dla orientacji zegara
    const offsetDegrees = 90 // offset 90 stopni, bo w Three.js 0 stopni to "wschód"
    const toRadians = (degrees) => (degrees + offsetDegrees) * (Math.PI / 180)

    // Ustawiamy rotację wskazówek
    if (secondHand.current) {
      secondHand.current.rotation.x = -toRadians(secondDegrees)
      secondHand.current.visible = true
    }
    if (minuteHand.current) {
      minuteHand.current.rotation.x = -toRadians(minuteDegrees)
    }
    if (hourHand.current) {
      hourHand.current.rotation.x = -toRadians(hourDegrees)
    }
  })

  const { position, rotationY, scale } = useControls('Zegar', {
    position: {
      value: [-0.5, 2, -4.9],
      step: 0.1,
    },
    rotationY: {
      value: 272,
      min: 0, 
      max: 360, 
      step: 1 
    },
    scale: {
      value: 1.5,
      min: 0.1,
      max: 5,
      step: 0.1,
    }
  })

  return (
    <Suspense fallback={null}>
      <primitive 
        object={scene} 
        position={position}
        rotation={[0, THREE.MathUtils.degToRad(rotationY), 0]}
        scale={scale}
        castShadow
        receiveShadow
      />
    </Suspense>
  )
}

// Pre-load the model
useGLTF.preload('./models/Zegar.glb') 