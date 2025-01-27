import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import './ChatInterface.css'

const API_KEY = '2d12bd421e3af7ce47223bce45944908'
const CHAT_API_URL = 'https://api.convai.com/character/getResponse'

const DEFAULT_QUESTION = "Cześć! Jak się masz?"

export function ChatInterface({ characterId }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showStarterQuestion, setShowStarterQuestion] = useState(true)
  const messagesEndRef = useRef(null)
  const audioRef = useRef(new Audio())
  const sessionId = useRef('-1')
  const chatContainerRef = useRef(null)
  const nodeRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e) => {
    e?.preventDefault()
    if (!inputMessage.trim()) return

    setShowStarterQuestion(false)

    const userMessage = {
      text: inputMessage,
      sender: 'user'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    const formData = new FormData()
    formData.append('userText', inputMessage)
    formData.append('charID', characterId)
    formData.append('sessionID', sessionId.current)
    formData.append('voiceResponse', 'True')

    try {
      console.log('Sending request with:', {
        userText: inputMessage,
        charID: characterId,
        sessionID: sessionId.current
      })

      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'CONVAI-API-KEY': API_KEY,
        },
        body: formData
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (data.text) {
        const botMessage = {
          text: data.text,
          sender: 'bot',
          audio: data.audio
        }
        setMessages(prev => [...prev, botMessage])

        if (data.sessionID) {
          sessionId.current = data.sessionID
          console.log('New session ID:', data.sessionID)
        }

        if (data.audio) {
          try {
            const audioBlob = new Blob(
              [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
              { type: 'audio/wav' }
            )
            const audioUrl = URL.createObjectURL(audioBlob)
            audioRef.current.src = audioUrl
            
            // Dodaj debugowanie zdarzeń audio
            audioRef.current.onplay = () => {
              console.log('Audio started playing - triggering animation')
              window.dispatchEvent(new Event('avatar-talking-start'))
            }
            audioRef.current.onended = () => {
              console.log('Audio ended - stopping animation')
              window.dispatchEvent(new Event('avatar-talking-end'))
            }
            audioRef.current.onpause = () => {
              console.log('Audio paused - stopping animation')
              window.dispatchEvent(new Event('avatar-talking-end'))
            }
            
            console.log('Playing audio...')
            await audioRef.current.play()
          } catch (e) {
            console.error('Error playing audio:', e)
          }
        }
      } else {
        throw new Error('No text response in data')
      }
    } catch (error) {
      console.error('Error details:', error)
      let errorMessage = 'Przepraszam, wystąpił błąd w komunikacji.'

      if (error.message.includes("exceeded")) {
        errorMessage = "Przekroczono limit zapytań API. Spróbuj ponownie później."
      } else if (error.message.includes("API key")) {
        errorMessage = "Problem z autoryzacją. Sprawdź swój klucz API."
      } else if (error.message.includes("Rate limit")) {
        errorMessage = "Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie."
      }

      setMessages(prev => [...prev, {
        text: errorMessage,
        sender: 'bot',
        error: true
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleStarterQuestionClick = () => {
    setInputMessage(DEFAULT_QUESTION)
    sendMessage()
  }

  return (
    <Draggable 
      nodeRef={nodeRef}
      handle=".chat-header"
      bounds="body"
    >
      <div ref={nodeRef} className="chat-interface">
        <div className="chat-header">
          <span>Chat</span>
          <div className="drag-handle">⋮⋮</div>
        </div>
        <div 
          ref={chatContainerRef}
          className="chat-messages"
        >
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
        <form onSubmit={sendMessage} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Napisz wiadomość..."
            className="chat-input"
          />
          <button type="submit" className="chat-send-button">
            Wyślij
          </button>
        </form>
      </div>
    </Draggable>
  )
} 