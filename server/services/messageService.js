import crypto from "node:crypto";
import messageRepository from "../repositories/messageRepository.js";
import redisClient from "../redis.js";

async function sendMessage({ roomId, userId, username, content }) {
  const message = await messageRepository.createMessage({
    id: crypto.randomUUID(),
    roomId,
    userId,
    username,
    content,
  });

  const cacheKey = `room:${roomId}:messages`;

  try {
    const cachedMessages = await redisClient.get(cacheKey);

    if (cachedMessages) {
      const messages = JSON.parse(cachedMessages);

      messages.push(message);

      await redisClient.set(cacheKey, JSON.stringify(messages));

      console.log("Redis cache updated");
    }
  } catch (error) {
    console.error("Redis update error:", error);
  }

  return message;
}

async function getRoomHistory(roomId) {
  const cacheKey = `room:${roomId}:messages`;

  try {
    const cachedMessages = await redisClient.get(cacheKey);

    if (cachedMessages) {
      console.log("Redis cache HIT");

      return JSON.parse(cachedMessages);
    }

    console.log("Redis cache MISS");
  } catch (error) {
    console.error("Redis read error:", error);
  }

  const messages = await messageRepository.getMessagesByRoomId(roomId);

  try {
    await redisClient.set(cacheKey, JSON.stringify(messages));
  } catch (error) {
    console.error("Redis write error:", error);
  }

  return messages;
}

const messageService = {
  sendMessage,
  getRoomHistory,
};

export default messageService;
