import { useBox } from '@react-three/cannon'

export function LeftWall(props) {
  const [ref1] = useBox(() => ({
    type: 'Static',
    args: [3.5, 3, 0.2],
    position: [-5, 1.5, -3.5],
    rotation: [0, Math.PI/2, 0],
    material: { friction: 0.5 }
  }))

  const [ref2] = useBox(() => ({
    type: 'Static',
    args: [3.5, 3, 0.2],
    position: [-5, 1.5, 3.5],
    rotation: [0, Math.PI/2, 0],
    material: { friction: 0.5 }
  }))

  return (
    <>
      <mesh ref={ref1} receiveShadow>
        <boxGeometry args={[3.5, 3, 0.2]} />
        <meshStandardMaterial color="#a0a0a0" />
      </mesh>
      <mesh ref={ref2} receiveShadow>
        <boxGeometry args={[3.5, 3, 0.2]} />
        <meshStandardMaterial color="#a0a0a0" />
      </mesh>
    </>
  )
} 