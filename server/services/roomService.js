import bcrypt from "bcrypt";
import roomRepository from "../repositories/roomRepository.js";
import crypto from "node:crypto";

async function getRoomById(roomId) {
  return roomRepository.getRoomById(roomId);
}

async function getAllRooms() {
  return roomRepository.getAllRooms();
}

async function authenticateRoom(roomId, password) {
  const room = await roomRepository.getRoomById(roomId);

  if (!room) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, room.password_hash);

  if (!passwordMatches) {
    return null;
  }

  return room;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function createRoom({ name, password }) {
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  return roomRepository.createRoom({
    id,
    name,
    passwordHash,
  });
}

const roomService = {
  getRoomById,
  getAllRooms,
  authenticateRoom,
  hashPassword,
  createRoom,
};

export default roomService;
