import { useBox } from '@react-three/cannon'

export function Ceiling({ position = [0, 4, 0], args = [100, 0.2, 100], color = '#d0d0d0', ...props }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    args: args,
    position: position,
    material: { friction: 0.5 },
    ...props
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
} 