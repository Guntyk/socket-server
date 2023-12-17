const { addUser, findUser, getRoomUsers, removeUser, updateUser } = require('./users');
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

let messages = {};

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }) => {
    socket.join(room);

    const { user } = addUser({ name, room });
    const joinMessage = { user: { name: 'Admin' }, message: `${user.name} has joined` };

    if (!messages[room]) {
      messages[room] = [];
    }
    messages[room].push(joinMessage);

    socket.emit('messageHistory', messages[room]);

    socket.broadcast.to(user.room).emit('message', { data: joinMessage });
    io.to(user.room).emit('roomUsersAction', { data: { users: getRoomUsers(user.room) } });
  });

  socket.on('sendMessage', ({ message, params }) => {
    const user = findUser(params);
    if (user) {
      messages[user.room].push({ user, message });
      io.to(user.room).emit('message', { data: { user, message } });
    }
  });

  socket.on('updateUserStatus', ({ user }) => {
    io.to(user.room).emit('roomUsersAction', { data: { users: updateUser(user) } });
  });

  socket.on('leftRoom', ({ params }) => {
    const user = removeUser(params);

    if (user) {
      const { room, name } = user;
      const leftMessage = { user: { name: 'Admin' }, message: `${name} has left` };

      messages[user.room].push(leftMessage);
      io.to(room).emit('message', { data: leftMessage });
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
