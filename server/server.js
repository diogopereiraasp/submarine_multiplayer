import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/ fica 1 nível acima de server/
const publicDir = path.join(__dirname, "../public");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.static(publicDir));

const connectedIds = new Set();

function broadcastConnectedIds() {
  io.emit("connected_ids", Array.from(connectedIds));
}

io.on("connection", (socket) => {
  connectedIds.add(socket.id);
  console.log("✅ connected:", socket.id);
  broadcastConnectedIds();

  // estado contínuo do player (posição em tempo real)
  socket.on("player_state", ({ x, y }) => {
    socket.broadcast.emit("player_state", { id: socket.id, x, y });
  });

  socket.on("disconnect", () => {
    connectedIds.delete(socket.id);
    console.log("❌ disconnected:", socket.id);
    broadcastConnectedIds();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});
