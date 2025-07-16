import React, { createContext, useContext, useReducer, useEffect } from 'react';
import socketService from '../socket/socket';
import toast from 'react-hot-toast';

const ChatContext = createContext();

const initialState = {
  user: null,
  currentRoom: 'general',
  rooms: new Map([['general', { id: 'general', name: 'General', messages: [], onlineUsers: [] }]]),
  privateChats: new Map(),
  typingUsers: new Map(),
  onlineUsers: [],
  isConnected: false,
  notifications: [],
  unreadCounts: new Map()
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    
    case 'ADD_ROOM':
      const newRooms = new Map(state.rooms);
      newRooms.set(action.payload.id, action.payload);
      return { ...state, rooms: newRooms };
    
    case 'SET_ROOM_MESSAGES':
      const updatedRooms = new Map(state.rooms);
      const room = updatedRooms.get(action.payload.roomId);
      if (room) {
        room.messages = action.payload.messages;
        updatedRooms.set(action.payload.roomId, room);
      }
      return { ...state, rooms: updatedRooms };
    
    case 'ADD_MESSAGE':
      const roomsWithMessage = new Map(state.rooms);
      const privateChatsWithMessage = new Map(state.privateChats);
      
      if (action.payload.roomId) {
        const room = roomsWithMessage.get(action.payload.roomId);
        if (room) {
          room.messages.push(action.payload);
          roomsWithMessage.set(action.payload.roomId, room);
        }
      } else {
        // Private message
        const chatKey = [state.user.id, action.payload.senderId].sort().join(':');
        if (!privateChatsWithMessage.has(chatKey)) {
          privateChatsWithMessage.set(chatKey, []);
        }
        privateChatsWithMessage.get(chatKey).push(action.payload);
      }
      
      return { 
        ...state, 
        rooms: roomsWithMessage, 
        privateChats: privateChatsWithMessage 
      };
    
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    
    case 'SET_TYPING_USERS':
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.set(action.payload.key, action.payload.users);
      return { ...state, typingUsers: newTypingUsers };
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    
    case 'UPDATE_UNREAD_COUNT':
      const newUnreadCounts = new Map(state.unreadCounts);
      newUnreadCounts.set(action.payload.key, action.payload.count);
      return { ...state, unreadCounts: newUnreadCounts };
    
    case 'SET_PRIVATE_MESSAGES':
      const updatedPrivateChats = new Map(state.privateChats);
      const chatKey = [state.user.id, action.payload.recipientId].sort().join(':');
      updatedPrivateChats.set(chatKey, action.payload.messages);
      return { ...state, privateChats: updatedPrivateChats };
    
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('authenticated', (user) => {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('room_messages', (data) => {
      dispatch({ type: 'SET_ROOM_MESSAGES', payload: data });
    });

    socket.on('new_message', (message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      
      // Show notification if not in current room/chat
      if (message.senderId !== state.user?.id) {
        const isCurrentRoom = message.roomId === state.currentRoom;
        const isCurrentPrivateChat = !message.roomId && 
          state.currentRoom === `private:${message.senderId}`;
        
        if (!isCurrentRoom && !isCurrentPrivateChat) {
          toast.success(`New message from ${message.senderName}`);
          
          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification(`New message from ${message.senderName}`, {
              body: message.content,
              icon: '/vite.svg'
            });
          }
        }
      }
    });

    socket.on('online_users', (users) => {
      dispatch({ type: 'SET_ONLINE_USERS', payload: users });
    });

    socket.on('user_joined', (data) => {
      toast.success(`${data.user.username} joined the chat`);
    });

    socket.on('user_left', (data) => {
      toast(`${data.user.username} left the chat`);
    });

    socket.on('user_typing', (data) => {
      const key = data.roomId || `private:${data.userId}`;
      dispatch({ 
        type: 'SET_TYPING_USERS', 
        payload: { key, users: [data.username] } 
      });
    });

    socket.on('user_stopped_typing', (data) => {
      const key = data.roomId || `private:${data.userId}`;
      dispatch({ 
        type: 'SET_TYPING_USERS', 
        payload: { key, users: [] } 
      });
    });

    socket.on('private_messages', (data) => {
      dispatch({ type: 'SET_PRIVATE_MESSAGES', payload: data });
    });

    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  const authenticate = (userData) => {
    socketService.authenticate(userData);
  };

  const joinRoom = (roomId) => {
    socketService.joinRoom(roomId);
    dispatch({ type: 'SET_CURRENT_ROOM', payload: roomId });
  };

  const sendMessage = (content, type = 'text') => {
    const data = {
      content,
      type,
      roomId: state.currentRoom.startsWith('private:') ? null : state.currentRoom,
      recipientId: state.currentRoom.startsWith('private:') ? 
        state.currentRoom.replace('private:', '') : null
    };
    
    socketService.sendMessage(data);
  };

  const startPrivateChat = (userId) => {
    const roomId = `private:${userId}`;
    dispatch({ type: 'SET_CURRENT_ROOM', payload: roomId });
    socketService.getPrivateMessages(userId);
  };

  const startTyping = () => {
    const data = {
      roomId: state.currentRoom.startsWith('private:') ? null : state.currentRoom,
      recipientId: state.currentRoom.startsWith('private:') ? 
        state.currentRoom.replace('private:', '') : null
    };
    
    socketService.startTyping(data);
  };

  const stopTyping = () => {
    const data = {
      roomId: state.currentRoom.startsWith('private:') ? null : state.currentRoom,
      recipientId: state.currentRoom.startsWith('private:') ? 
        state.currentRoom.replace('private:', '') : null
    };
    
    socketService.stopTyping(data);
  };

  const reactToMessage = (messageId, reaction) => {
    socketService.reactToMessage({
      messageId,
      reaction,
      roomId: state.currentRoom.startsWith('private:') ? null : state.currentRoom
    });
  };

  const value = {
    ...state,
    authenticate,
    joinRoom,
    sendMessage,
    startPrivateChat,
    startTyping,
    stopTyping,
    reactToMessage
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};