import { pool } from "../db.js";

async function getRoomById(roomId) {
  const result = await pool.query(
    `
      SELECT id, name, password_hash
      FROM rooms
      WHERE id = $1;
    `,
    [roomId],
  );

  return result.rows[0] ?? null;
}

async function createRoom({ id, name, passwordHash }) {
  const result = await pool.query(
    `
      INSERT INTO rooms (
        id,
        name,
        password_hash
      )
      VALUES ($1, $2, $3)
      RETURNING id, name, created_at;
    `,
    [id, name, passwordHash],
  );

  return result.rows[0];
}

async function getAllRooms() {
  const result = await pool.query(
    `
      SELECT id, name, created_at
      FROM rooms
      ORDER BY created_at ASC;
    `,
  );

  return result.rows;
}

const roomRepository = {
  getRoomById,
  getAllRooms,
  createRoom,
};

export default roomRepository;
