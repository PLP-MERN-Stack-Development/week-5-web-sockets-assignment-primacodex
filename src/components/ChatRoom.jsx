import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Hash, Users, Settings, Search, Paperclip } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import OnlineUsers from './OnlineUsers';
import TypingIndicator from './TypingIndicator';

const ChatRoom = () => {
  const {
    user,
    currentRoom,
    rooms,
    privateChats,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    onlineUsers,
    joinRoom,
    startPrivateChat
  } = useChat();

  const [message, setMessage] = useState('');
  const [showUsersList, setShowUsersList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentMessages = currentRoom.startsWith('private:') 
    ? privateChats.get([user.id, currentRoom.replace('private:', '')].sort().join(':')) || []
    : rooms.get(currentRoom)?.messages || [];

  const filteredMessages = currentMessages.filter(msg =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage(message.trim());
    setMessage('');
    stopTyping();
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (e.target.value.trim() && !typingTimeoutRef.current) {
      startTyping();
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const getCurrentRoomName = () => {
    if (currentRoom.startsWith('private:')) {
      const userId = currentRoom.replace('private:', '');
      const user = onlineUsers.find(u => u.id === userId);
      return user ? `Private: ${user.username}` : 'Private Chat';
    }
    return rooms.get(currentRoom)?.name || currentRoom;
  };

  const getCurrentTypingUsers = () => {
    const key = currentRoom.startsWith('private:') 
      ? `private:${user.id}` 
      : currentRoom;
    return typingUsers.get(key) || [];
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping();
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">ChatApp</h2>
            <button
              onClick={() => setShowUsersList(!showUsersList)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-800">{user?.username}</p>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Rooms
            </h3>
            <div className="space-y-1">
              {Array.from(rooms.entries()).map(([roomId, room]) => (
                <button
                  key={roomId}
                  onClick={() => joinRoom(roomId)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                    currentRoom === roomId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">{room.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Online Users */}
        {showUsersList && (
          <OnlineUsers
            users={onlineUsers}
            currentUser={user}
            onStartPrivateChat={startPrivateChat}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{getCurrentRoomName()}</h3>
                <p className="text-sm text-gray-500">
                  {onlineUsers.length} members online
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <MessageList
            messages={filteredMessages}
            currentUser={user}
            searchTerm={searchTerm}
          />
          <TypingIndicator users={getCurrentTypingUsers()} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <input
                ref={messageInputRef}
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder={`Message ${getCurrentRoomName()}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;