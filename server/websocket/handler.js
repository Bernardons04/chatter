import roomManager from "./roomManager.js";

import messageService from "../services/messageService.js";
import roomService from "../services/roomService.js";

export function handleConnection(socket) {
  console.log("Client connected");

  socket.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "test": {
          console.log("Test message:", data.content);

          socket.send("Hello from server!");

          break;
        }

        case "join_room": {
          const { roomId, password } = data;

          const room = await roomService.authenticateRoom(roomId, password);

          if (!room) {
            socket.send(
              JSON.stringify({
                type: "error",
                message: "Invalid room or password",
              }),
            );

            break;
          }

          roomManager.addClientToRoom(roomId, socket);

          const messages = await messageService.getRoomHistory(roomId);

          socket.send(
            JSON.stringify({
              type: "room_joined",
              room: {
                id: room.id,
                name: room.name,
              },
              messages,
            }),
          );

          console.log("Client joined room:", roomId);

          break;
        }

        case "leave_room": {
          const { roomId } = data;

          roomManager.removeClientFromRoom(roomId, socket);

          socket.send(
            JSON.stringify({
              type: "room_left",
              roomId,
            }),
          );

          console.log("Client left room:", roomId);

          break;
        }

        case "send_message": {
          const { roomId, userId, username, content } = data;

          if (!roomManager.isClientInRoom(roomId, socket)) {
            break;
          }

          const newMessage = await messageService.sendMessage({
            roomId,
            userId,
            username,
            content,
          });

          roomManager.broadcastToRoom(roomId, {
            type: "new_message",
            message: newMessage,
          });

          break;
        }

        case "create_room": {
          const { name, password } = data;

          try {
            const room = await roomService.createRoom({
              name,
              password,
            });

            socket.send(
              JSON.stringify({
                type: "room_created",
                room,
              }),
            );
          } catch (error) {
            if (error.code === "23505") {
              socket.send(
                JSON.stringify({
                  type: "error",
                  message: "Room name already exists",
                }),
              );

              break;
            }

            console.error("Create room error:", error);

            socket.send(
              JSON.stringify({
                type: "error",
                message: "Failed to create room",
              }),
            );
          }

          break;
        }
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  socket.on("close", () => {
    roomManager.removeClientFromAllRooms(socket);

    console.log("Client disconnected");
  });
}
