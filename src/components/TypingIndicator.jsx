import React from 'react';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="px-4 py-2">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>
          {users.length === 1 
            ? `${users[0]} is typing...` 
            : `${users.join(', ')} are typing...`
          }
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;