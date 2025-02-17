import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { useRef, useEffect } from 'react'

export const FPVCamera = ({ speed = 5, sensitivity = 0.002 }) => {
  const { camera, gl } = useThree()
  const moveVector = useRef(new Vector3())
  const isLocked = useRef(false)
  
  const [_, get] = useKeyboardControls()

  useEffect(() => {
    const canvas = gl.domElement
    
    const onPointerLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas
    }
    
    const onClick = () => {
      canvas.requestPointerLock()
    }

    const onMouseMove = (e) => {
      if (isLocked.current) {
        camera.rotation.y -= e.movementX * sensitivity
        camera.rotation.x -= e.movementY * sensitivity
        camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x))
      }
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('mousemove', onMouseMove)

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('mousemove', onMouseMove)
    }
  }, [camera, gl, sensitivity])

  useFrame((_, delta) => {
    const { forward, backward, left, right } = get()
    const moveSpeed = speed * delta
    
    // Reset wektor ruchu
    moveVector.current.set(0, 0, 0)
    
    // Oblicz kierunek ruchu
    if (forward) moveVector.current.z -= 1
    if (backward) moveVector.current.z += 1
    if (left) moveVector.current.x -= 1
    if (right) moveVector.current.x += 1
    
    // Normalizuj i zastosuj prędkość
    moveVector.current.normalize()
    moveVector.current.multiplyScalar(moveSpeed)
    
    // Aktualizuj pozycję kamery
    if (moveVector.current.length() > 0) {
      camera.translateX(moveVector.current.x)
      camera.translateZ(moveVector.current.z)
    }
  })

  return null
} 