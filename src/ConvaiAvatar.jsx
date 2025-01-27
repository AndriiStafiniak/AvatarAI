import React, { useEffect, useState, Suspense, useRef } from 'react'
import { useGLTF, useProgress } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { LoadingSpinner } from './components/LoadingSpinner'
import { SceneObject } from './components/SceneObject'

const API_KEY = '2d12bd421e3af7ce47223bce45944908'
const AVATAR_ID = '9ff38f44-437d-11ef-9187-42010a7be011'
const CONVAI_API_URL = 'https://api.convai.com/character/get'

function AvatarModel({ modelUrl, isPlaying, ...props }) {
  const { scene } = useGLTF(modelUrl)
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const groupRef = useRef()
  
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

function ModelLoader({ children }) {
  const { progress } = useProgress()
  return (
    <>
      {progress < 100 && <LoadingSpinner progress={progress} />}
      {children}
    </>
  )
}

export function ConvaiAvatar(props) {
  const [characterData, setCharacterData] = useState(null)
  const [modelUrl, setModelUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTalking, setIsTalking] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [actions] = useState("Wave, Nod, Smile, Point, Dance")
  const [objects] = useState([
    { name: "Self", description: "The avatar itself" },
    { name: "User", description: "The person interacting with the avatar" }
  ])
  const [characters] = useState([
    { name: "User", bio: "Person interacting with the avatar" },
    { name: "Assistant", bio: "AI assistant avatar" }
  ])

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
        setIsLoading(true)
        setLoadingProgress(10)

        const response = await fetch(CONVAI_API_URL, {
          method: 'POST',
          headers: {
            'CONVAI-API-KEY': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            charID: AVATAR_ID
          })
        })

        setLoadingProgress(30)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to fetch character: ${errorData.message || 'Unknown error'}`)
        }

        const data = await response.json()
        setLoadingProgress(50)
        
        if (data.character_id && data.model_details?.modelLink) {
          console.log('Character name:', data.character_name)
          console.log('Model URL:', data.model_details.modelLink)
          setCharacterData(data)
          setModelUrl(data.model_details.modelLink)
          setLoadingProgress(70)
        } else {
          throw new Error('No character data or model URL received')
        }
      } catch (error) {
        console.error('Error fetching character:', error)
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacterData()
  }, [])

  const convertToString = (list) => {
    return list.map(item => JSON.stringify(item)).join(';')
  }

  const sendMessage = async (message) => {
    try {
      const response = await fetch('https://api.convai.com/character/getResponse', {
        method: 'POST',
        headers: {
          'CONVAI-API-KEY': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: message,
          charID: AVATAR_ID,
          sessionID: props.sessionId,
          voiceResponse: 'true',
          actions: actions,
          classification: 'multistep',
          objects: convertToString(objects),
          characters: convertToString(characters),
        }),
      })

      const data = await response.json()
      
      if (data.actionSequence) {
        const actionList = data.actionSequence.split('\n').filter(action => action.trim())
        console.log('Actions to perform:', actionList)
      }

      if (data.character_id && data.model_details?.modelLink) {
        console.log('Character name:', data.character_name)
        console.log('Model URL:', data.model_details.modelLink)
        setCharacterData(data)
        setModelUrl(data.model_details.modelLink)
        setLoadingProgress(70)
      } else {
        throw new Error('No character data or model URL received')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (isLoading || !modelUrl) {
    return <LoadingSpinner progress={loadingProgress} />
  }

  if (error) {
    console.log('Error state:', error)
    return <LoadingSpinner progress={100} />
  }

  return (
    <Suspense fallback={<LoadingSpinner progress={70} />}>
      <ModelLoader>
        <SceneObject />
        <AvatarModel 
          modelUrl={modelUrl}
          isPlaying={isTalking}
          {...props} 
        />
      </ModelLoader>
    </Suspense>
  )
} 