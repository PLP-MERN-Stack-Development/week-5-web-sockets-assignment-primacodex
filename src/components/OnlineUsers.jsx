import React from 'react';
import { MessageSquare, Circle } from 'lucide-react';

const OnlineUsers = ({ users, currentUser, onStartPrivateChat }) => {
  const otherUsers = users.filter(user => user.id !== currentUser.id);

  return (
    <div className="border-t border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
        Online Users ({otherUsers.length})
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {otherUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <Circle className="w-3 h-3 text-green-500 fill-current absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{user.username}</p>
                <p className="text-xs text-gray-500">{user.status}</p>
              </div>
            </div>
            <button
              onClick={() => onStartPrivateChat(user.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
            >
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ))}
        {otherUsers.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No other users online
          </p>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;