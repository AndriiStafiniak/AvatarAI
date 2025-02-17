import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { useRef, useEffect } from 'react'
import { useSphere } from '@react-three/cannon'

export const FPVCamera = ({ speed = 5, sensitivity = 0.002 }) => {
  const { camera, gl } = useThree()
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 1, 0],
    args: [0.5]
  }))

  const velocity = useRef([0, 0, 0])
  useEffect(() => api.velocity.subscribe(v => (velocity.current = v)), [api])
  
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
    const direction = new Vector3()
    const frontVector = new Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0))
    const sideVector = new Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0)

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation)

    api.velocity.set(direction.x, velocity.current[1], direction.z)

    // Synchronizuj pozycję kamery z ciałem fizycznym
    ref.current.getWorldPosition(camera.position)
  })

  return null
} 