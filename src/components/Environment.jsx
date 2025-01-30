import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

export function Environment() {
  const { scene, gl } = useThree()

  useEffect(() => {
    const pmremGenerator = new PMREMGenerator(gl)
    pmremGenerator.compileEquirectangularShader()

    new RGBELoader()
      .load('/blue_photo_studio_2k.exr', (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture
        scene.environment = envMap
        scene.background = envMap

        texture.dispose()
        pmremGenerator.dispose()
      })

    return () => {
      scene.environment = null
      scene.background = null
    }
  }, [scene, gl])

  return null
} 