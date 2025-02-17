import { useBox } from '@react-three/cannon'

export function Ceiling(props) {
  const [ref] = useBox(() => ({
    type: 'Static',
    args: [10, 0.2, 10],
    position: [0, 3, 0],
    material: { friction: 0.5 }
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[10, 0.2, 10]} />
      <meshStandardMaterial color="#d0d0d0" />
    </mesh>
  )
} 