import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "../public");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.static(publicDir));

const connectedIds = new Set();
const playerPositions = new Map(); // id -> { x, y }

function broadcastConnectedIds() {
  io.emit("connected_ids", Array.from(connectedIds));
}

io.on("connection", (socket) => {
  connectedIds.add(socket.id);
  console.log("✅ connected:", socket.id);

  socket.emit(
    "players_state",
    Array.from(playerPositions.entries()).map(([id, pos]) => ({
      id,
      x: pos.x,
      y: pos.y,
    }))
  );

  broadcastConnectedIds();

  socket.on("player_state", ({ x, y }) => {
    playerPositions.set(socket.id, { x, y });
    socket.broadcast.emit("player_state", { id: socket.id, x, y });
  });

  socket.on("disconnect", () => {
    connectedIds.delete(socket.id);
    playerPositions.delete(socket.id);
    console.log("❌ disconnected:", socket.id);
    broadcastConnectedIds();
  });
});

function getLocalIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return null;
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);

  const ip = getLocalIPv4();
  if (ip) console.log(`🌐 http://${ip}:${PORT}`);
});
