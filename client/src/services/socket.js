import { io } from 'socket.io-client'

let socket = null

export function connectSocket() {
  if (socket) return socket
  const token = localStorage.getItem('token')
  socket = io(import.meta.env.VITE_API_WS || 'https://srit-campusconnect-update.onrender.com', {
    auth: { token }
  })
  return socket
}

export function getSocket(){ return socket }
