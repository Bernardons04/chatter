import { pool } from "../db.js";

async function createMessage({ id, roomId, userId, username, content }) {
  const result = await pool.query(
    `
      INSERT INTO messages (
        id,
        room_id,
        user_id,
        username,
        content
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, room_id, user_id, username, content, created_at
    `,
    [id, roomId, userId, username, content],
  );

  return result.rows[0];
}

async function getMessagesByRoomId(roomId) {
  const result = await pool.query(
    `
      SELECT id, user_id, username, content, created_at
      FROM messages
      WHERE room_id = $1
      ORDER BY created_at ASC
      LIMIT 100;
    `,
    [roomId],
  );

  return result.rows;
}

const messageRepository = {
  createMessage,
  getMessagesByRoomId,
};

export default messageRepository;
