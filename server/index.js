import http from "node:http";
import { WebSocketServer } from "ws";

import { handleConnection } from "./websocket/handler.js";
import redisClient from "./redis.js";

import roomService from "./services/roomService.js";

const server = http.createServer(async (req, res) => {
  // CORS headers (allow the Next.js dev server and any origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/rooms") {
    try {
      const rooms = await roomService.getAllRooms();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(rooms));
    } catch (error) {
      console.error("GET /rooms error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
    return;
  }

  res.writeHead(200);
  res.end("Chatter server is running");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  handleConnection(socket);
});

try {
  await redisClient.connect();
} catch (error) {
  console.error("Redis unavailable:", error);
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
