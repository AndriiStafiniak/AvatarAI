import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import './ChatInterface.css'
import { MdMic, MdMicOff, MdSend, MdRefresh } from 'react-icons/md'
import { ConvaiClient } from 'convai-web-sdk'

const DEFAULT_QUESTION = "Cześć! Jak się masz?"

export function ChatInterface({ characterId }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showStarterQuestion, setShowStarterQuestion] = useState(true)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const nodeRef = useRef(null)
  const [micError, setMicError] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [audioStream, setAudioStream] = useState(null)
  const audioAnalyser = useRef(null)
  const silenceTimer = useRef(null)
  
  // Convai Client refs
  const convaiClient = useRef(null)
  const finalizedUserText = useRef("")
  const npcTextRef = useRef("")

  // Dodaj nowe stałe (można dostosować wartości)
  const SILENCE_THRESHOLD = -45 // dB
  const SILENCE_DELAY = 1500 // ms

  useEffect(() => {
    let initializedClient = null
    const initClient = async () => {
      try {
        initializedClient = new ConvaiClient({
          apiKey: '2d12bd421e3af7ce47223bce45944908',
          characterId: characterId,
          enableAudio: true,
          sessionId: '-1',
          disableAudioGeneration: false
        })
        
        if (initializedClient.audioContext) {
          try {
            await new Promise(resolve => setTimeout(resolve, 100))
            await initializedClient.audioContext.resume()
          } catch (audioError) {
            console.error('Audio Context Error:', audioError)
            setMicError('Wymagane zezwolenie na dźwięk - kliknij gdziekolwiek na stronie')
          }
        }
        
        convaiClient.current = initializedClient

        // Setup response callback
        convaiClient.current.setResponseCallback((response) => {
          if (response.hasUserQuery()) {
            const transcript = response.getUserQuery()
            if (transcript.getIsFinal()) {
              finalizedUserText.current += " " + transcript.getTextData()
              setMessages(prev => [...prev, {
                text: finalizedUserText.current,
                sender: 'user'
              }])
            }
          }
          
          if (response.hasAudioResponse()) {
            const audioResponse = response.getAudioResponse()
            npcTextRef.current = audioResponse.getTextData()
            setIsTyping(false)
            
            setMessages(prev => [...prev, {
              text: npcTextRef.current,
              sender: 'bot',
              audio: audioResponse.getAudioData()
            }])
          }
        })

        // Setup audio handlers
        convaiClient.current.onAudioPlay(() => {
          window.dispatchEvent(new Event('avatar-talking-start'))
        })

        convaiClient.current.onAudioStop(() => {
          window.dispatchEvent(new Event('avatar-talking-end'))
        })
      } catch (error) {
        console.error('Init error:', error)
        setMicError('Błąd inicjalizacji czatu głosowego')
      }
    }

    initClient()
    return () => {
      if (initializedClient) {
        if (typeof initializedClient.destroy === 'function') {
          initializedClient.destroy()
        } else if (typeof initializedClient.close === 'function') {
          initializedClient.close()
        } else {
          console.warn('ConvaiClient has no destroy/close method')
        }
      }
    }
  }, [characterId])

  const handleMicClick = async () => {
    try {
      if (!isLiveMode) {
        // Rozpocznij nasłuchiwanie
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Twoja przeglądarka nie wspiera nagrywania głosu')
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setAudioStream(stream)
        
        // Inicjalizacja analizatora audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        audioAnalyser.current = analyser
        
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)
        
        setIsLiveMode(true)
        setMicError(null)
        finalizedUserText.current = ""
        await convaiClient.current.startAudioChunk()
        
        // Rozpocznij monitorowanie poziomu dźwięku
        checkAudioLevel()
      } else {
        // Zatrzymaj nasłuchiwanie
        stopListening()
      }
    } catch (error) {
      console.error('Microphone error:', error)
      setMicError(error.message || 'Błąd dostępu do mikrofonu')
      setIsLiveMode(false)
    }
  }

  const checkAudioLevel = () => {
    if (!isLiveMode) return

    const dataArray = new Uint8Array(audioAnalyser.current.frequencyBinCount)
    audioAnalyser.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    const dB = 20 * Math.log10(average / 255)

    if (dB > SILENCE_THRESHOLD) {
      // Dźwięk wykryty - zresetuj timer
      if (silenceTimer.current) clearTimeout(silenceTimer.current)
      silenceTimer.current = setTimeout(() => {
        stopListening()
      }, SILENCE_DELAY)
    }

    requestAnimationFrame(checkAudioLevel)
  }

  const stopListening = async () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current)
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop())
    }
    setIsLiveMode(false)
    setIsTyping(true)
    
    try {
      if (convaiClient.current) {
        await convaiClient.current.endAudioChunk()
      }
    } catch (error) {
      console.error('Recording error:', error)
      setIsTyping(false)
    }
  }

  const sendTextMessage = async (e) => {
    e?.preventDefault()
    if (!inputMessage.trim()) return

    setShowStarterQuestion(false)
    setIsTyping(true)
    
    setMessages(prev => [...prev, {
      text: inputMessage,
      sender: 'user'
    }])
    
    try {
      await convaiClient.current.sendTextChunk(inputMessage)
      setInputMessage('')
    } catch (error) {
      console.error('Error sending text:', error)
      setIsTyping(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleRefresh = async () => {
    setMessages([])
    setInputMessage('')
    setIsTyping(false)
    setShowStarterQuestion(true)
    setMicError(null)
    
    // Reinitialize Convai client
    if (convaiClient.current) {
      if (typeof convaiClient.current.destroy === 'function') {
        convaiClient.current.destroy()
      } else if (typeof convaiClient.current.close === 'function') {
        convaiClient.current.close()
      }
      convaiClient.current = null
    }
    
    // Initialize new client
    const initClient = async () => {
      try {
        const initializedClient = new ConvaiClient({
          apiKey: '2d12bd421e3af7ce47223bce45944908',
          characterId: characterId,
          enableAudio: true,
          sessionId: '-1',
          disableAudioGeneration: false
        })
        
        if (initializedClient.audioContext) {
          try {
            await new Promise(resolve => setTimeout(resolve, 100))
            await initializedClient.audioContext.resume()
          } catch (audioError) {
            console.error('Audio Context Error:', audioError)
            setMicError('Wymagane zezwolenie na dźwięk - kliknij gdziekolwiek na stronie')
          }
        }
        
        convaiClient.current = initializedClient

        // Setup response callback
        convaiClient.current.setResponseCallback((response) => {
          if (response.hasUserQuery()) {
            const transcript = response.getUserQuery()
            if (transcript.getIsFinal()) {
              finalizedUserText.current += " " + transcript.getTextData()
              setMessages(prev => [...prev, {
                text: finalizedUserText.current,
                sender: 'user'
              }])
            }
          }
          
          if (response.hasAudioResponse()) {
            const audioResponse = response.getAudioResponse()
            npcTextRef.current = audioResponse.getTextData()
            setIsTyping(false)
            
            setMessages(prev => [...prev, {
              text: npcTextRef.current,
              sender: 'bot',
              audio: audioResponse.getAudioData()
            }])
          }
        })

        // Setup audio handlers
        convaiClient.current.onAudioPlay(() => {
          window.dispatchEvent(new Event('avatar-talking-start'))
        })

        convaiClient.current.onAudioStop(() => {
          window.dispatchEvent(new Event('avatar-talking-end'))
        })
      } catch (error) {
        console.error('Init error:', error)
        setMicError('Błąd inicjalizacji czatu głosowego')
      }
    }
    
    await initClient()
  }

  return (
    <Draggable nodeRef={nodeRef} handle=".chat-header" bounds="body">
      <div ref={nodeRef} className="chat-interface">
        <div className="chat-header">
          <span>Chat</span>
          <div className="header-controls">
            <button 
              className="refresh-button" 
              onClick={handleRefresh}
              title="Odśwież czat"
            >
              <MdRefresh />
            </button>
            <div className="drag-handle">⋮⋮</div>
          </div>
        </div>
        <div ref={chatContainerRef} className="chat-messages">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.sender} ${msg.error ? 'error' : ''}`}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-controls">
          <div className="mic-container">
            <button
              type="button"
              className={`mic-button ${isLiveMode ? 'recording' : ''} ${micError ? 'error' : ''}`}
              onClick={handleMicClick}
              title={micError || (isLiveMode ? 'Kliknij aby zakończyć' : 'Kliknij aby rozpocząć rozmowę')}
            >
              {isLiveMode ? <MdMicOff /> : <MdMic />}
            </button>
            {micError && <div className="mic-error">{micError}</div>}
          </div>
          <form onSubmit={sendTextMessage} className="chat-input-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Napisz wiadomość..."
              className="chat-input"
            />
            <button type="submit" className="chat-send-button" title="Wyślij">
              <MdSend />
            </button>
          </form>
        </div>
      </div>
    </Draggable>
  )
} 