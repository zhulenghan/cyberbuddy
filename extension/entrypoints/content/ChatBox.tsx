/**
 * Chat Box Component
 * 
 * A small chat interface below the pet
 */

import { useState, useRef, useEffect } from 'react'

interface ChatBoxProps {
  petName: string
  position: { x: number; y: number }
  onClose: () => void
}

interface Message {
  id: string
  sender: 'user' | 'pet'
  text: string
  timestamp: number
}

export default function ChatBox({ petName, position, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'pet',
      text: `Hi! I'm ${petName}. Ask me anything!`,
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response (you can integrate with your backend here)
    setTimeout(() => {
      const petResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'pet',
        text: generateResponse(userMessage.text),
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, petResponse])
      setIsTyping(false)
    }, 1000)
  }

  const generateResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase()
    
    // Check for focus-related questions
    if (lowerText.includes('focus') || lowerText.includes('专注') || lowerText.includes('多久')) {
      return "You've been focused for a great session! Keep it up! 💪"
    }
    
    if (lowerText.includes('website') || lowerText.includes('page') || lowerText.includes('网站') || lowerText.includes('页面')) {
      const currentUrl = window.location.hostname
      return `You're currently on ${currentUrl}. Seems productive! 🎯`
    }
    
    if (lowerText.includes('break') || lowerText.includes('休息')) {
      return "Good idea! Taking breaks helps you stay productive. Try the focus timer! ⏰"
    }
    
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('你好')) {
      return `Hello! I'm here to help you stay focused! 😊`
    }
    
    // Default responses
    const responses = [
      "That's interesting! Tell me more! 🤔",
      "I'm here to support your focus journey! 🎯",
      "Keep up the great work! 💪",
      "Remember to take breaks too! ☕",
      "You're doing amazing! 🌟",
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y + 140}px`, // Below the pet
        width: '280px',
        backgroundColor: '#1a1a1a',
        border: '3px solid #00ffff',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 255, 255, 0.3)',
        zIndex: 10000,
        fontFamily: 'monospace',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#00ffff',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #000',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000' }}>
          💬 Chat with {petName}
        </span>
        <button
          onClick={onClose}
          style={{
            background: '#ff0000',
            border: '2px solid #000',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '2px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          height: '200px',
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <div
              style={{
                background: msg.sender === 'user' ? '#ff00ff' : '#00ffff',
                color: '#000',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                wordWrap: 'break-word',
                border: '2px solid #000',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div
              style={{
                background: '#00ffff',
                color: '#000',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                border: '2px solid #000',
              }}
            >
              <span className="typing-animation">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '8px',
          borderTop: '2px solid #555',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '8px',
            border: '2px solid #555',
            borderRadius: '4px',
            background: '#2a2a2a',
            color: '#fff',
            fontSize: '11px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            background: input.trim() ? '#00ffff' : '#555',
            border: '2px solid #000',
            color: '#000',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          ➤
        </button>
      </div>

    </div>
  )
}

