// websocket-server/index.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi origin
  }
});

io.on('connection', (socket) => {
  console.log('🔵 New client connected:', socket.id);

  socket.on('join_course', (courseId) => {
    socket.join(`course_${courseId}`);
    console.log(`📚 Client ${socket.id} joined course_${courseId}`);
  });

  socket.on('send_message', (data) => {
    console.log('💬 Message:', data);

    // Gửi lại cho tất cả người trong room
    io.to(`course_${data.courseId}`).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('🚀 WebSocket server is running at http://localhost:4000');
});
