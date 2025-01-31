import { useGLTF, Html } from '@react-three/drei'
import { useControls } from 'leva'
import { useRef } from 'react'

export function Tv() {
  const { scene } = useGLTF('./models/Tv.glb')
  const tvRef = useRef()

  const { position, rotation, scale } = useControls('TV', {
    position: {
      value: [3, 2, -4.8],
      step: 0.1,
    },
    rotation: {
      value: [0, 190, 0],
      step: 0.1,
    },
    scale: {
      value: 0.9,
      min: 0.1,
      max: 5,
      step: 0.1,
    }
  })

  const htmlControls = useControls('HTML Position', {
    x: { value: -0.15, min: -2, max: 2, step: 0.01 },
    y: { value: -0.00, min: -2, max: 2, step: 0.01 },
    z: { value: -0.03, min: -2, max: 2, step: 0.01 },
    scale: { value: 0.41, min: 0.0001, max: 1, step: 0.0001 },
    rotationY: { value: 55, min: 0, max: 360, step: 1 }
  })

  return (
    <group ref={tvRef} position={position} rotation={[0, rotation[1], 0]} scale={scale}>
      <primitive object={scene} />
      
      <Html
        transform
        wrapperClass="tv-screen"
        distanceFactor={1.5} // Dostosuj do skali modelu
        position={[htmlControls.x, htmlControls.y, htmlControls.z]}
        rotation={[0, htmlControls.rotationY, 0]} // Rotacja 180 stopni wokół osi Y
        zIndexRange={[0, 1]}
      >
        <div style={{ transform: `scale(${htmlControls.scale})` }}>
          <iframe
            width="1280"
            height="720"
            src="https://www.youtube.com/embed/CxkEEqOfxf8?autoplay=1&mute=1&controls=0&list=PLix4uCYO06P4PtycABU6S-19ZWIIu_fdH"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              border: 'none',
              pointerEvents: 'none'
            }}
          />
        </div>
      </Html>
    </group>
  )
}

// Pre-load the model
useGLTF.preload('./models/Tv.glb') 