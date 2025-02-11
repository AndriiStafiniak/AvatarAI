import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export function Tv() {
  const { scene } = useGLTF('./models/Tv.glb')
  const tvRef = useRef()
  const videoRef = useRef()
  const materialRef = useRef()

  const { position, rotation, scale } = useControls('TV', {
    position: {
      value: [3, 2, -4.8],
      step: 0.1,
    },
    rotation: {
      value: [0, Math.PI * 1.5 , 0],
      step: 0.01,
    },

    scale: {
      value: 0.9,
      min: 0.1,
      max: 5,
      step: 0.1,
    }
  })

  const debugControls = useControls('TV Screen Debug', {
    visible: {
      value: true,
      onChange: (v) => {
        if (materialRef.current) {
          materialRef.current.visible = v
        }
      }
    },
    rotateUV: {
      value: Math.PI/2,
      min: 0,
      max: Math.PI * 2,
      step: 0.1,
      onChange: (v) => {
        if (materialRef.current && materialRef.current.map) {
          materialRef.current.map.rotation = v
          materialRef.current.map.needsUpdate = true
        }
      }
    },
    flipX: {
      value: true,
      onChange: (v) => {
        if (materialRef.current && materialRef.current.map) {
          materialRef.current.map.repeat.x = v ? -1 : 1
          materialRef.current.map.offset.x = v ? 1 : 0
          materialRef.current.map.needsUpdate = true
        }
      }
    },
    flipY: {
      value: true,
      onChange: (v) => {
        if (materialRef.current && materialRef.current.map) {
          materialRef.current.map.repeat.y = v ? -1 : 1
          materialRef.current.map.needsUpdate = true
        }
      }
    },
    offsetX: {
      value: 0,
      min: -1,
      max: 1,
      step: 0.1,
      onChange: (v) => {
        if (materialRef.current && materialRef.current.map) {
          materialRef.current.map.offset.x = v
          materialRef.current.map.needsUpdate = true
        }
      }
    },
    offsetY: {
      value: 1,
      min: -1,
      max: 1,
      step: 0.1,
      onChange: (v) => {
        if (materialRef.current && materialRef.current.map) {
          materialRef.current.map.offset.y = v
          materialRef.current.map.needsUpdate = true
        }
      }
    }
  })

  useEffect(() => {
    // Znajdź mesh ekranu TV
    const screen = scene.getObjectByName('Ekran')
    if (!screen) {
      console.error('Could not find TV screen mesh named "Ekran"')
      return
    }

    // Tworzenie elementu video
    const video = document.createElement('video')
    video.src = '/videos/logo_film.mp4'
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    // Tworzenie tekstury z video
    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.needsUpdate = true
    
    // Korekta odwrócenia osi X
    videoTexture.repeat.x = -1
    videoTexture.offset.x = 1
    videoTexture.wrapS = THREE.RepeatWrapping

    // Proste ustawienia materiału
    const material = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide,
      toneMapped: false,
    })

    // Przypisanie materiału
    screen.material = material
    materialRef.current = material

    // Automatyczne odtwarzanie
    const playVideo = () => {
      video.play().catch(error => {})
    }

    if (video.readyState >= 3) {
      playVideo()
    } else {
      video.addEventListener('loadeddata', playVideo, { once: true })
    }

    videoRef.current = video

    return () => {
      video.pause()
      video.remove()
      material.dispose()
      videoTexture.dispose()
    }
  }, [scene])

  // Dodaj handler do ponownego uruchomienia video w razie utraty kontekstu
  useEffect(() => {
    const handleContextLost = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(console.error)
      }
    }

    const handleContextRestored = () => {
      if (materialRef.current) {
        materialRef.current.map.needsUpdate = true
      }
    }

    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost)
      canvas.addEventListener('webglcontextrestored', handleContextRestored)
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost)
        canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      }
    }
  }, [])

  return (
    <group 
      ref={tvRef} 
      position={position} 
      rotation={new THREE.Euler(rotation[0], rotation[1], rotation[2])} 
      scale={scale}
    >
      <primitive object={scene} />
    </group>
  )
}

// Pre-load the model
useGLTF.preload('./models/Tv.glb') 