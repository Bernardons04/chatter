const rooms = new Map();

function addClientToRoom(roomId, socket) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  rooms.get(roomId).add(socket);
}

function removeClientFromRoom(roomId, socket) {
  const room = rooms.get(roomId);

  if (!room) {
    return;
  }

  room.delete(socket);

  if (room.size === 0) {
    rooms.delete(roomId);
  }
}

function isClientInRoom(roomId, socket) {
  const room = rooms.get(roomId);

  return room?.has(socket) ?? false;
}

function broadcastToRoom(roomId, message) {
  const room = rooms.get(roomId);

  if (!room) {
    return;
  }

  for (const client of room) {
    client.send(JSON.stringify(message));
  }
}

function removeClientFromAllRooms(socket) {
  for (const [roomId, room] of rooms) {
    room.delete(socket);

    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }
}

function getRooms() {
  return rooms;
}

const roomManager = {
  addClientToRoom,
  removeClientFromRoom,
  isClientInRoom,
  broadcastToRoom,
  removeClientFromAllRooms,
  getRooms,
};

export default roomManager;
