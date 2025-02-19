import React from 'react'
import { useBox } from '@react-three/cannon'

const Room = ({ position, isFirstRoom = true }) => {
  // Kolorystyka do rozróżnienia pokoi
  const wallColor = isFirstRoom ? '#d4a574' : '#a5b4c4'
  const floorColor = isFirstRoom ? '#8b4513' : '#696969'

  // Ściany pokoju (3 pełne ściany + ściana z otworem na drzwi)
  return (
    <group position={position} rotation={[0, Math.PI/2, 0]}>
      {/* Podłoga */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <boxGeometry args={[10, 10, 0.2]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Ściana tylna */}
      <mesh position={[0, 2.5, -5]}>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Ściana lewa */}
      <mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Ściana prawa */}
      <mesh position={[5, 2.5, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  )
}

export default React.memo(Room) 