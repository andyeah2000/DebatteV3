import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'

interface UseWebSocketReturn {
  socket: Socket | null
  isConnected: boolean
  error: Error | null
}

export function useWebSocket(): UseWebSocketReturn {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:4000', {
      auth: {
        token: session.user.id
      }
    })

    // Connection event handlers
    socket.on('connect', () => {
      setIsConnected(true)
      setError(null)
      console.log('WebSocket connected')
    })

    socket.on('connect_error', (err) => {
      setIsConnected(false)
      setError(err)
      console.error('WebSocket connection error:', err)
    })

    socket.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('WebSocket disconnected:', reason)
    })

    // Join user-specific room
    socket.emit('joinRoom', `user:${session.user.id}`)

    // Store socket reference
    socketRef.current = socket

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
        socketRef.current = null
      }
    }
  }, [session?.user?.id])

  return {
    socket: socketRef.current,
    isConnected,
    error
  }
} 