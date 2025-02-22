const trimStr = require('./utils');
let users = [];

const findUser = (user) => {
  if (!user || !user.name || !user.room) return undefined;
  return users.find((u) => trimStr(u.name) === trimStr(user.name) && trimStr(u.room) === trimStr(user.room));
};

const addUser = (user) => {
  const isExist = findUser(user);

  if (!isExist) {
    users.push(user);
  }

  const currentUser = isExist || user;

  return { isExist: !!isExist, user: currentUser };
};

const getRoomUsers = (room) => {
  return users.filter((u) => u.room === room);
};

const updateUser = (updatedUser) => {
  const userIndex = users.findIndex((u) => u.name === updatedUser.name);
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    return getRoomUsers(updatedUser.room);
  }
};

const removeUser = (user) => {
  if (!user || !user.name || !user.room) return undefined;

  const found = findUser(user);

  if (found) {
    users = users.filter(({ room, name }) => room === found.room && name !== found.name);
  }

  return found;
};

module.exports = { addUser, findUser, getRoomUsers, updateUser, removeUser };
