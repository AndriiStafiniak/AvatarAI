import React, { useEffect, useState, Suspense, useRef } from 'react'
import { useGLTF, useProgress, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { LoadingSpinner } from './components/LoadingSpinner'
import { SceneObject } from './components/SceneObject'
import { useConvai } from './contexts/ConvaiContext'
import axios from 'axios'
import { useFrame } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'

const API_KEY = '2d12bd421e3af7ce47223bce45944908'
const AVATAR_ID = '9ff38f44-437d-11ef-9187-42010a7be011'
const CONVAI_API_URL = 'https://api.convai.com/character/get'
const ANIMATED_MODEL_URL = 'https://models.readyplayer.me/animated-avatar.glb' // URL do modelu z animacjami

function AvatarModel({ modelUrl, isPlaying, currentAction, onLoad, ...props }) {
  const { scene } = useGLTF(modelUrl)
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const groupRef = useRef()
  const mixerRef = useRef()
  const [talkingAnimation, setTalkingAnimation] = useState(null)

  // Załaduj animację FBX
  useEffect(() => {
    const fbxLoader = new FBXLoader()
    fbxLoader.load(
      '/animation/avatarIdle.fbx',
      (fbx) => {
        console.log('FBX loaded:', fbx)
        if (fbx.animations && fbx.animations.length > 0) {
          console.log('Found animations in FBX:', fbx.animations)
          setTalkingAnimation(fbx.animations[0])
        }
      },
      (progress) => {
        console.log('Loading FBX:', (progress.loaded / progress.total) * 100, '%')
      },
      (error) => {
        console.error('Error loading FBX:', error)
      }
    )
  }, [])

  // Ustaw mixer i animację
  useEffect(() => {
    if (clone && talkingAnimation) {
      console.log('Setting up animation mixer')
      mixerRef.current = new THREE.AnimationMixer(clone)
      const action = mixerRef.current.clipAction(talkingAnimation)
      
      if (isPlaying) {
        console.log('Playing animation')
        action.reset().fadeIn(0.5).play()
      } else {
        console.log('Stopping animation')
        action.fadeOut(0.5)
      }

      return () => {
        mixerRef.current.stopAllAction()
      }
    }
  }, [clone, talkingAnimation, isPlaying])

  // Aktualizuj mixer w każdej klatce
  useEffect(() => {
    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      if (mixerRef.current) {
        mixerRef.current.update(0.016) // około 60fps
      }
    }
    
    animate()
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <group ref={groupRef}>
      <primitive 
        object={clone} 
        {...props}
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
      />
    </group>
  )
}

export function ConvaiAvatar({ onLoad, ...props }) {
  const [characterData, setCharacterData] = useState(null)
  const [modelUrl, setModelUrl] = useState(null)
  const [isTalking, setIsTalking] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [actions] = useState("Play, Serve, Give, Call Cab")
  const [objects] = useState([
    { name: "Mojito (Can be: Served|Cannot be: Played, Given)", description: "For once, a VIRGIN Mojito." },
    { name: "Self", description: "The avatar itself" },
    { name: "User", description: "The person interacting with the avatar" }
  ])
  const [characters] = useState([
    { name: "User", bio: "The person interacting with the avatar" },
    { name: "AI Assistant", bio: "Helpful virtual assistant" }
  ])
  const [currentAction, setCurrentAction] = useState('')
  const [error, setError] = useState(null)

  // Nasłuchuj zdarzeń audio z ChatInterface
  useEffect(() => {
    const handleTalkingStart = () => {
      console.log('Avatar talking started')
      setIsTalking(true)
    }
    const handleTalkingEnd = () => {
      console.log('Avatar talking ended')
      setIsTalking(false)
    }

    window.addEventListener('avatar-talking-start', handleTalkingStart)
    window.addEventListener('avatar-talking-end', handleTalkingEnd)

    return () => {
      window.removeEventListener('avatar-talking-start', handleTalkingStart)
      window.removeEventListener('avatar-talking-end', handleTalkingEnd)
    }
  }, [])

  useEffect(() => {
    async function fetchCharacterData() {
      try {
        const response = await fetch(CONVAI_API_URL, {
          method: 'POST',
          headers: {
            'CONVAI-API-KEY': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ charID: AVATAR_ID })
        });

        if (!response.ok) throw new Error('Failed to fetch character');
        
        const data = await response.json();
        if (data?.model_details?.modelLink) {
          setModelUrl(data.model_details.modelLink);
        } else {
          throw new Error('Invalid model URL');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error);
      }
    }
    fetchCharacterData();
  }, []);

  const convertObjects = (items) => {
    return items.map(item => JSON.stringify(item)).join(';')
  }

  const handleConvaiResponse = async (text) => {
    try {
      const response = await axios.post(
        'https://api.convai.com/character/getResponse',
        {
          userText: text,
          charID: import.meta.env.VITE_CONVAI_CHAR_ID,
          sessionID: '-1',
          voiceResponse: 'true',
          actions: actions,
          classification: 'multistep',
          objects: convertObjects(objects),
          characters: convertObjects(characters),
        },
        {
          headers: {
            'CONVAI-API-KEY': import.meta.env.VITE_CONVAI_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Full Convai response:', response.data)

      if (response.data.actionSequence) {
        const actionSequence = response.data.actionSequence.trim()
        console.log('Action sequence received:', actionSequence)
        // Rozbij sekwencję akcji na pojedyncze akcje
        const individualActions = actionSequence.split('\n').map(action => action.trim())
        console.log('Individual actions:', individualActions)
        
        // Wykonuj akcje jedna po drugiej
        individualActions.forEach((action, index) => {
          setTimeout(() => {
            console.log('Triggering action:', action)
            setCurrentAction(action)
          }, index * 1000) // 1 sekunda odstępu między akcjami
        })
      }

      if (response.data.character_id && response.data.model_details?.modelLink) {
        console.log('Character name:', response.data.character_name)
        console.log('Model URL:', response.data.model_details.modelLink)
        setCharacterData(response.data)
        setModelUrl(response.data.model_details.modelLink)
        setLoadingProgress(70)
      } else {
        throw new Error('No character data or model URL received')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const triggerAnimation = (action) => {
    console.log('Triggering animation for:', action)
  }

  if (error) return null;
  if (!modelUrl) return <LoadingSpinner progress={70} />;

  return (
    <Suspense fallback={<LoadingSpinner progress={70} />}>
      <AvatarModel 
        modelUrl={modelUrl}
        isPlaying={isTalking}
        currentAction={currentAction}
        onLoad={onLoad}
        {...props} 
      />
    </Suspense>
  )
} 