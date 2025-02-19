import { useBox } from '@react-three/cannon'
import { useControls } from 'leva'

export function Ceiling(props) {
  const controls = useControls('Ceiling', {
    position: { value: [0, 3, 0], label: 'Position' },
    size: { value: [10, 0.2, 10], label: 'Size' },
    color: { value: '#d0d0d0', label: 'Color' }
  })

  const [ref] = useBox(() => ({
    type: 'Static',
    args: [100, 0.2, 100], // Stała kolizja 100x100
    position: controls.position,
    material: { friction: 0.5 },
    ...props
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={controls.size} />
      <meshStandardMaterial color={controls.color} />
    </mesh>
  )
} 