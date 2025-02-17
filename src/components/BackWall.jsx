import { useBox } from '@react-three/cannon'

export function BackWall(props) {
  const [ref] = useBox(() => ({
    type: 'Static',
    args: [10, 3, 0.2],
    position: [0, 1.5, 5],
    material: { friction: 0.5 }
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[10, 3, 0.2]} />
      <meshStandardMaterial color="#a0a0a0" />
    </mesh>
  )
} 