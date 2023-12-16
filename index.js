const { addUser, findUser, getRoomUsers, removeUser } = require('./users');
const { Server } = require('socket.io');
const express = require('express');
const route = require('./route');
const http = require('http');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }) => {
    socket.join(room);

    const { user } = addUser({ name, room });

    socket.broadcast.to(user.room).emit('message', {
      data: { user: { name: 'Admin' }, message: `${user.name} has joined` },
    });

    io.to(user.room).emit('roomUsersAction', { data: { users: getRoomUsers(user.room) } });
  });

  socket.on('sendMessage', ({ message, params }) => {
    const user = findUser(params);
    if (user) {
      io.to(user.room).emit('message', { data: { user, message } });
    }
  });

  socket.on('leftRoom', ({ params }) => {
    const user = removeUser(params);

    if (user) {
      const { room, name } = user;

      io.to(room).emit('message', { data: { user: { name: 'Admin' }, message: `${name} has left` } });

      io.to(room).emit('roomUsersAction', { data: { users: getRoomUsers(room) } });
    }
  });

  io.on('disconnect', () => {
    console.log('Disconnect');
  });
});

server.listen(5000, () => {
  console.log('Server running');
});
