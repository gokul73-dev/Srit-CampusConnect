import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import API from '../services/api';
import Button from '../components/ui/Button';

export default function Chat() {
  const { room } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  useEffect(() => {
    if (!room) return;

    async function loadMessages() {
      try {
        const res = await API.get(`/messages/${room}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadMessages();
  }, [room]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !room) return;

    socket.emit('join-room', room);

    const handleNewMessage = (msg) => {
      if (msg.room === room) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const handleTyping = (data) => {
      if (data.userId !== user?._id) {
        setTypingUser(data.name);
        setTimeout(() => setTypingUser(null), 2000);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('online-users', handleOnlineUsers);
    socket.on('user-typing', handleTyping);

    return () => {
      socket.emit('leave-room', room);
      socket.off('message:new', handleNewMessage);
      socket.off('online-users', handleOnlineUsers);
      socket.off('user-typing', handleTyping);
    };
  }, [socket, room, user]);

  useEffect(scrollToBottom, [messages]);

  const sendMessage = () => {
    if (!socket || !text.trim()) return;

    socket.emit('message', {
      room,
      text,
      meta: replyingTo ? { replyTo: replyingTo._id } : {},
    });

    setText('');
    setReplyingTo(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Header */}
      <div className="border-b p-4 bg-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {room === 'general'
            ? '# General Campus Chat'
            : `# ${room}`}
        </h2>

        <div className="flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          {onlineUsers.length} online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`max-w-lg p-3 rounded-lg ${
              msg.from?._id === user?._id
                ? 'ml-auto bg-primary text-white'
                : 'bg-white border'
            }`}
          >
            <div className="text-xs font-semibold mb-1">
              {msg.from?.name} ({msg.from?.role})
            </div>

            {/* Reply Preview */}
            {msg.replyTo && (
              <div className="bg-gray-200 text-black text-xs p-2 mb-2 rounded">
                <strong>{msg.replyTo.from?.name}</strong>: {msg.replyTo.text}
              </div>
            )}

            <div>{msg.text}</div>

            <div className="flex justify-between items-center mt-1">
              <span className="text-xs opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>

              <button
                className="text-xs text-blue-500"
                onClick={() => setReplyingTo(msg)}
              >
                Reply
              </button>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUser && (
        <div className="px-4 text-sm text-gray-500">
          {typingUser} is typing...
        </div>
      )}

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="bg-gray-100 p-2 border-l-4 border-blue-500 flex justify-between items-center text-sm">
          <div>
            Replying to <strong>{replyingTo.from?.name}</strong>: {replyingTo.text}
          </div>
          <button onClick={() => setReplyingTo(null)}>✕</button>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4 bg-white flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket?.emit('typing', room);
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>

    </div>
  );
}
