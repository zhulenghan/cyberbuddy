/**
 * Chat Box Component
 * 
 * A small chat interface below the pet
 */

import { useState, useRef, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useActivityStore } from '@/lib/store/activityStore'

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
  const { todayStats, loadTodayStats } = useActivityStore()

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

    try {
      // 1) Focus-time intent: answer locally without AI
      const local = await maybeGetFocusedTimeReply(userMessage.text)
      if (local) {
        const petResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'pet',
          text: local,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, petResponse])
        setIsTyping(false)
        return
      }

      // 2) Otherwise call backend AI chat (ephemeral)
      const resp = await apiClient.post<{ reply: string }>(
        '/chat',
        { message: userMessage.text, petName }
      )

      const replyText = resp.success && (resp.data as any)?.reply
        ? (resp.data as any).reply
        : "I'm here with you! Let's keep going."

      const petResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'pet',
        text: replyText,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, petResponse])
    } catch (err) {
      const petResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'pet',
        text: "Sorry, I couldn't think for a moment. Let's try again!",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, petResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const maybeGetFocusedTimeReply = async (userText: string): Promise<string | null> => {
    const lower = userText.toLowerCase()
    const focusedRegex = /(focus(ed)?( time)?|how long|专注|多久)/i
    if (!focusedRegex.test(lower)) return null

    if (!todayStats) {
      await loadTodayStats()
    }
    const stats = useActivityStore.getState().todayStats
    const focusedMs = stats?.byLabel?.focused?.duration || 0
    const reply = formatFocusedDuration(focusedMs)
    return reply
  }

  const formatFocusedDuration = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) {
      return `You've been focused for ${hours}h ${minutes}m today. Proud of you! 🌟`
    }
    return `You've been focused for ${minutes}m today. Keep it up! 💪`
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

