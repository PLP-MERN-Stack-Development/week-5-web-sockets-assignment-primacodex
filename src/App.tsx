import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ChatProvider, useChat } from './context/ChatContext';
import LoginForm from './components/LoginForm';
import ChatRoom from './components/ChatRoom';
import ConnectionStatus from './components/ConnectionStatus';

const AppContent = () => {
  const { user } = useChat();

  return (
    <div className="h-screen">
      <ConnectionStatus />
      {user ? <ChatRoom /> : <LoginForm />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;