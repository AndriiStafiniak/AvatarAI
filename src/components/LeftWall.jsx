import { useBox } from '@react-three/cannon'

export function LeftWall(props) {
  const [ref] = useBox(() => ({
    type: 'Static',
    args: [10, 3, 0.2],
    position: [-5, 1.5, 0],
    rotation: [0, Math.PI/2, 0],
    material: { friction: 0.5 }
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[10, 3, 0.2]} />
      <meshStandardMaterial color="#a0a0a0" />
    </mesh>
  )
} 