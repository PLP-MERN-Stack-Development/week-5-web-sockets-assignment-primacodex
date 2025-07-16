import React, { useEffect, useRef } from 'react';
import { Heart, ThumbsUp, Laugh, MoreHorizontal } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const MessageList = ({ messages, currentUser, searchTerm }) => {
  const { reactToMessage } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReaction = (messageId, reaction) => {
    reactToMessage(messageId, reaction);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
    );
  };

  const getReactionIcon = (reaction) => {
    switch (reaction) {
      case 'heart':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'thumbsup':
        return <ThumbsUp className="w-4 h-4 text-blue-500" />;
      case 'laugh':
        return <Laugh className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.senderId === currentUser.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white text-gray-800 border border-gray-200'
            }`}
          >
            {message.senderId !== currentUser.id && (
              <div className="flex items-center space-x-2 mb-1">
                <img
                  src={`https://ui-avatars.com/api/?name=${message.senderName}&background=random&size=24`}
                  alt={message.senderName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-gray-600">
                  {message.senderName}
                </span>
              </div>
            )}
            
            <div className="mb-1">
              {highlightText(message.content, searchTerm)}
            </div>
            
            <div className="flex items-center justify-between text-xs opacity-75">
              <span>{formatTime(message.timestamp)}</span>
              {message.senderId !== currentUser.id && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleReaction(message.id, 'heart')}
                    className="hover:bg-gray-100 p-1 rounded"
                  >
                    <Heart className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleReaction(message.id, 'thumbsup')}
                    className="hover:bg-gray-100 p-1 rounded"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleReaction(message.id, 'laugh')}
                    className="hover:bg-gray-100 p-1 rounded"
                  >
                    <Laugh className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Reactions */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                {Object.entries(message.reactions).map(([reaction, users]) => (
                  users.length > 0 && (
                    <div
                      key={reaction}
                      className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-xs"
                    >
                      {getReactionIcon(reaction)}
                      <span>{users.length}</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;