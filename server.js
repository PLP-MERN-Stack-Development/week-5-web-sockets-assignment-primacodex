const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
let users = new Map();
let rooms = new Map();
let messages = new Map();
let privateMessages = new Map();
let typingUsers = new Map();

// Initialize default room
rooms.set('general', {
  id: 'general',
  name: 'General',
  users: new Set(),
  messages: []
});

// Utility functions
const getUsersInRoom = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.users).map(userId => users.get(userId)).filter(Boolean);
};

const addMessageToRoom = (roomId, message) => {
  const room = rooms.get(roomId);
  if (room) {
    room.messages.push(message);
    // Keep only last 100 messages per room
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }
  }
};

const createMessage = (senderId, content, type = 'text', roomId = null) => {
  const sender = users.get(senderId);
  return {
    id: uuidv4(),
    senderId,
    senderName: sender?.username || 'Unknown',
    content,
    type,
    timestamp: new Date(),
    roomId,
    reactions: {},
    readBy: new Set([senderId])
  };
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.username}&background=random`,
      status: 'online',
      lastSeen: new Date()
    };
    
    users.set(socket.id, user);
    
    // Join general room by default
    socket.join('general');
    const generalRoom = rooms.get('general');
    generalRoom.users.add(socket.id);
    
    // Send user info back
    socket.emit('authenticated', user);
    
    // Send existing messages
    socket.emit('room_messages', {
      roomId: 'general',
      messages: generalRoom.messages
    });
    
    // Notify others about new user
    socket.to('general').emit('user_joined', {
      user,
      roomId: 'general'
    });
    
    // Send online users
    io.to('general').emit('online_users', getUsersInRoom('general'));
  });

  // Handle joining rooms
  socket.on('join_room', (roomId) => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.join(roomId);
    
    let room = rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        name: roomId,
        users: new Set(),
        messages: []
      };
      rooms.set(roomId, room);
    }
    
    room.users.add(socket.id);
    
    // Send room messages
    socket.emit('room_messages', {
      roomId,
      messages: room.messages
    });
    
    // Notify others
    socket.to(roomId).emit('user_joined', {
      user,
      roomId
    });
    
    // Send online users for this room
    io.to(roomId).emit('online_users', getUsersInRoom(roomId));
  });

  // Handle leaving rooms
  socket.on('leave_room', (roomId) => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.leave(roomId);
    
    const room = rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);
      
      // Notify others
      socket.to(roomId).emit('user_left', {
        user,
        roomId
      });
      
      // Send updated online users
      io.to(roomId).emit('online_users', getUsersInRoom(roomId));
    }
  });

  // Handle sending messages
  socket.on('send_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = createMessage(socket.id, data.content, data.type, data.roomId);
    
    if (data.roomId) {
      // Room message
      addMessageToRoom(data.roomId, message);
      io.to(data.roomId).emit('new_message', message);
    } else if (data.recipientId) {
      // Private message
      const privateKey = [socket.id, data.recipientId].sort().join(':');
      if (!privateMessages.has(privateKey)) {
        privateMessages.set(privateKey, []);
      }
      privateMessages.get(privateKey).push(message);
      
      // Send to both users
      socket.emit('new_message', message);
      socket.to(data.recipientId).emit('new_message', message);
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const key = data.roomId || data.recipientId;
    if (!typingUsers.has(key)) {
      typingUsers.set(key, new Set());
    }
    typingUsers.get(key).add(socket.id);
    
    if (data.roomId) {
      socket.to(data.roomId).emit('user_typing', {
        userId: socket.id,
        username: user.username,
        roomId: data.roomId
      });
    } else if (data.recipientId) {
      socket.to(data.recipientId).emit('user_typing', {
        userId: socket.id,
        username: user.username,
        recipientId: data.recipientId
      });
    }
  });

  socket.on('typing_stop', (data) => {
    const key = data.roomId || data.recipientId;
    if (typingUsers.has(key)) {
      typingUsers.get(key).delete(socket.id);
    }
    
    if (data.roomId) {
      socket.to(data.roomId).emit('user_stopped_typing', {
        userId: socket.id,
        roomId: data.roomId
      });
    } else if (data.recipientId) {
      socket.to(data.recipientId).emit('user_stopped_typing', {
        userId: socket.id,
        recipientId: data.recipientId
      });
    }
  });

  // Handle message reactions
  socket.on('react_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const { messageId, reaction, roomId } = data;
    
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const message = room.messages.find(m => m.id === messageId);
        if (message) {
          if (!message.reactions[reaction]) {
            message.reactions[reaction] = new Set();
          }
          
          // Toggle reaction
          if (message.reactions[reaction].has(socket.id)) {
            message.reactions[reaction].delete(socket.id);
          } else {
            message.reactions[reaction].add(socket.id);
          }
          
          // Convert Sets to arrays for JSON serialization
          const reactionsForClient = {};
          Object.keys(message.reactions).forEach(r => {
            reactionsForClient[r] = Array.from(message.reactions[r]);
          });
          
          io.to(roomId).emit('message_reaction', {
            messageId,
            reactions: reactionsForClient,
            roomId
          });
        }
      }
    }
  });

  // Handle message read receipts
  socket.on('mark_read', (data) => {
    const { messageId, roomId } = data;
    
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const message = room.messages.find(m => m.id === messageId);
        if (message) {
          message.readBy.add(socket.id);
          
          io.to(roomId).emit('message_read', {
            messageId,
            readBy: Array.from(message.readBy),
            roomId
          });
        }
      }
    }
  });

  // Handle getting private messages
  socket.on('get_private_messages', (data) => {
    const { recipientId } = data;
    const privateKey = [socket.id, recipientId].sort().join(':');
    const messages = privateMessages.get(privateKey) || [];
    
    socket.emit('private_messages', {
      recipientId,
      messages
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user) {
      // Remove from all rooms
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          
          // Notify others
          socket.to(roomId).emit('user_left', {
            user,
            roomId
          });
          
          // Send updated online users
          io.to(roomId).emit('online_users', getUsersInRoom(roomId));
        }
      });
      
      // Remove from typing users
      typingUsers.forEach((typingSet, key) => {
        typingSet.delete(socket.id);
      });
      
      // Update user status
      user.status = 'offline';
      user.lastSeen = new Date();
    }
    
    users.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});