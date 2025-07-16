import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
  }

  connect() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Chat specific methods
  authenticate(userData) {
    this.emit('authenticate', userData);
  }

  joinRoom(roomId) {
    this.emit('join_room', roomId);
  }

  leaveRoom(roomId) {
    this.emit('leave_room', roomId);
  }

  sendMessage(data) {
    this.emit('send_message', data);
  }

  startTyping(data) {
    this.emit('typing_start', data);
  }

  stopTyping(data) {
    this.emit('typing_stop', data);
  }

  reactToMessage(data) {
    this.emit('react_message', data);
  }

  markAsRead(data) {
    this.emit('mark_read', data);
  }

  getPrivateMessages(recipientId) {
    this.emit('get_private_messages', { recipientId });
  }
}

export default new SocketService();