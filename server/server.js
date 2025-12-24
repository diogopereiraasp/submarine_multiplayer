import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import { WORLD } from "../public/src/core/world.js";

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
const playerPositions = new Map();

/**
 * Mantém em sync com o tamanho do player no client (entities/player.js).
 * Se você mudar o size lá, ajuste aqui também.
 */
const PLAYER_SIZE = 30;

function broadcastConnectedIds() {
  io.emit("connected_ids", Array.from(connectedIds));
}

function getLocalIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return null;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickSpawnPosition() {
  const width = WORLD?.width ?? 1200;
  const height = WORLD?.height ?? 1200;

  const maxX = Math.max(0, width - PLAYER_SIZE);
  const maxY = Math.max(0, height - PLAYER_SIZE);

  // distância mínima entre centros (evita nascer em cima/colado)
  const minDist = Math.max(PLAYER_SIZE * 3, 90);
  const tries = 120;

  for (let i = 0; i < tries; i++) {
    const x = randInt(0, maxX);
    const y = randInt(0, maxY);

    const cx = x + PLAYER_SIZE / 2;
    const cy = y + PLAYER_SIZE / 2;

    let ok = true;
    for (const pos of playerPositions.values()) {
      const pcx = pos.x + PLAYER_SIZE / 2;
      const pcy = pos.y + PLAYER_SIZE / 2;
      if (Math.hypot(pcx - cx, pcy - cy) < minDist) {
        ok = false;
        break;
      }
    }

    if (ok) return { x, y };
  }

  // fallback: mapa cheio
  return { x: randInt(0, maxX), y: randInt(0, maxY) };
}

io.on("connection", (socket) => {
  connectedIds.add(socket.id);

  // ✅ spawn aleatório sem colidir
  playerPositions.set(socket.id, pickSpawnPosition());

  // snapshot inicial (inclui o próprio id)
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

  // ===== SONAR =====
  socket.on("sonar_emit", ({ x, y }) => {
    const origin = playerPositions.get(socket.id);
    if (!origin) return;

    const maxRadius = 1800;
    const speed = 900;

    for (const [targetId, targetPos] of playerPositions.entries()) {
      if (targetId === socket.id) continue;

      const dx = targetPos.x - x;
      const dy = targetPos.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxRadius) continue;

      const delayMs = (dist / speed) * 1000;
      const angleToTarget = Math.atan2(dy, dx);

      setTimeout(() => {
        if (!connectedIds.has(targetId)) return;

        // alvo recebe direção de onde veio (alvo -> emissor)
        io.to(targetId).emit("sonar_hit", { angle: angleToTarget + Math.PI });

        // emissor recebe confirmação (emissor -> alvo)
        io.to(socket.id).emit("sonar_confirm", { angle: angleToTarget });
      }, delayMs);
    }
  });

  socket.on("disconnect", () => {
    connectedIds.delete(socket.id);
    playerPositions.delete(socket.id);
    broadcastConnectedIds();
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
  const ip = getLocalIPv4();
  if (ip) console.log(`🌐 http://${ip}:${PORT}`);
});
