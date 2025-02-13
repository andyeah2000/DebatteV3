import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export function useSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      auth: {
        token: session.accessToken,
      },
      transports: ['websocket'],
      autoConnect: true,
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Join user's room for personalized notifications
    socketRef.current.emit('join', `user:${session.user.id}`);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session]);

  return socketRef.current;
} 