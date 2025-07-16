import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const ConnectionStatus = () => {
  const { isConnected } = useChat();

  return (
    <div className={`fixed top-4 right-4 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg transition-all ${
      isConnected 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isConnected ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;