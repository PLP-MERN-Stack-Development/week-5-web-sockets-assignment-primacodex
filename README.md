# Real-Time Chat Application with Socket.io

A fully-featured real-time chat application built with React, Node.js, Express, and Socket.io. This application demonstrates bidirectional communication between clients and server with advanced chat features.

## Features

### Core Chat Functionality
- ✅ Real-time messaging using Socket.io
- ✅ User authentication (username-based)
- ✅ Global chat room for all users
- ✅ Message display with sender name and timestamp
- ✅ Online/offline status indicators
- ✅ Connection status monitoring

### Advanced Features
- ✅ Private messaging between users
- ✅ Multiple chat rooms support
- ✅ Typing indicators
- ✅ Message reactions (heart, thumbs up, laugh)
- ✅ Real-time notifications
- ✅ Browser notifications
- ✅ Message search functionality
- ✅ Sound notifications
- ✅ Responsive design

### Real-Time Notifications
- ✅ New message notifications
- ✅ User join/leave notifications
- ✅ Browser notification support
- ✅ Toast notifications
- ✅ Typing indicators

### Performance & UX
- ✅ Reconnection handling
- ✅ Message delivery acknowledgment
- ✅ Optimized Socket.io usage
- ✅ Mobile-responsive design
- ✅ Smooth animations and transitions

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

   This will start both the server (port 3001) and client (port 5173) concurrently.

3. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - Enter a username to join the chat

## Project Structure

```
├── server.js              # Express server with Socket.io
├── src/
│   ├── context/
│   │   └── ChatContext.jsx # React context for chat state
│   ├── components/
│   │   ├── LoginForm.jsx   # User authentication
│   │   ├── ChatRoom.jsx    # Main chat interface
│   │   ├── MessageList.jsx # Message display
│   │   ├── OnlineUsers.jsx # Online users list
│   │   ├── TypingIndicator.jsx # Typing indicator
│   │   └── ConnectionStatus.jsx # Connection status
│   ├── socket/
│   │   └── socket.js       # Socket.io client service
│   └── App.tsx             # Main application component
```

## Technical Implementation

### Socket.io Events

**Client to Server:**
- `authenticate` - User login
- `join_room` - Join chat room
- `send_message` - Send message
- `typing_start/stop` - Typing indicators
- `react_message` - Message reactions
- `get_private_messages` - Fetch private messages

**Server to Client:**
- `authenticated` - Login confirmation
- `new_message` - New message broadcast
- `user_joined/left` - User presence updates
- `online_users` - Online users list
- `user_typing` - Typing notifications
- `message_reaction` - Reaction updates

### Features Implemented

1. **Real-time Communication**: Bidirectional Socket.io connection
2. **User Authentication**: Simple username-based system
3. **Chat Rooms**: Support for multiple rooms and private chats
4. **Message Features**: Reactions, search, timestamps
5. **Notifications**: Browser notifications and toast messages
6. **Responsive Design**: Mobile-friendly interface
7. **Performance**: Optimized message handling and reconnection

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Technologies Used

- **Frontend**: React, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Real-time**: Socket.io

## Production Considerations

For production deployment:
1. Use a proper database (PostgreSQL, MongoDB)
2. Implement Redis for scaling Socket.io
3. Add proper authentication (JWT)
4. Implement rate limiting
5. Add message persistence
6. Use environment variables for configuration
7. Add proper error handling and logging

This application demonstrates a complete real-time chat system with modern web technologies and best practices.