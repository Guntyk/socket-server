const trimStr = require('./utils');
let users = [];

const findUser = (user) => users.find((u) => trimStr(u.name) === trimStr(user.name) && trimStr(u.room) === trimStr(user.room));

const addUser = (user) => {
  const isExist = findUser(user);

  !isExist && users.push(user);

  const currentUser = isExist || user;

  return { isExist: !!isExist, user: currentUser };
};

const getRoomUsers = (room) => {
  return users.filter((u) => u.room === room);
};

const removeUser = (user) => {
  const found = findUser(user);

  if (found) {
    users = users.filter(({ room, name }) => room === found.room && name !== found.name);
  }

  return found;
};

module.exports = { addUser, findUser, getRoomUsers, removeUser };
