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
const playerPositions = new Map(); // id -> {x,y}

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

function spawnPositionAvoidingOthers() {
  const padding = 30;
  const minX = padding;
  const minY = padding;
  const maxX = Math.max(padding, WORLD.width - padding);
  const maxY = Math.max(padding, WORLD.height - padding);

  // usa detectRadius como “zona de segurança” para não nascer colado
  const detect = WORLD?.sonar?.detectRadius ?? 0;
  const safeDist = Math.max(60, Math.min(220, detect * 0.35)); // mantém comportamento estável

  for (let attempt = 0; attempt < 60; attempt++) {
    const x = randInt(minX, maxX);
    const y = randInt(minY, maxY);

    let ok = true;
    for (const [, p] of playerPositions.entries()) {
      const dx = p.x - x;
      const dy = p.y - y;
      if (Math.hypot(dx, dy) < safeDist) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }

  return { x: randInt(minX, maxX), y: randInt(minY, maxY) };
}

io.on("connection", (socket) => {
  connectedIds.add(socket.id);

  const spawn = spawnPositionAvoidingOthers();
  playerPositions.set(socket.id, spawn);

  broadcastConnectedIds();

  // manda estado completo para quem entrou
  socket.emit(
    "players_state",
    Array.from(playerPositions.entries()).map(([id, pos]) => ({
      id,
      x: pos.x,
      y: pos.y,
    }))
  );

  // manda apenas o novo para os outros
  socket.broadcast.emit("player_state", { id: socket.id, x: spawn.x, y: spawn.y });

  socket.on("player_state", ({ x, y }) => {
    playerPositions.set(socket.id, { x, y });
    socket.broadcast.emit("player_state", { id: socket.id, x, y });
  });

  // ===== SONAR =====
  socket.on("sonar_emit", ({ x, y }) => {
    const origin = playerPositions.get(socket.id);
    if (!origin) return;

    const sonarCfg = WORLD?.sonar ?? {};
    const maxRadius = typeof sonarCfg.maxRadius === "number" ? sonarCfg.maxRadius : 1800;
    const speed = typeof sonarCfg.speed === "number" ? sonarCfg.speed : 900;
    const detectRadius =
      typeof sonarCfg.detectRadius === "number" ? sonarCfg.detectRadius : maxRadius;

    // usa a posição do servidor como fonte de verdade
    const ox = origin.x;
    const oy = origin.y;

    for (const [targetId, targetPos] of playerPositions.entries()) {
      if (targetId === socket.id) continue;

      const dx = targetPos.x - ox;
      const dy = targetPos.y - oy;
      const dist = Math.hypot(dx, dy);

      // ✅ detectRadius controla quem é "identificado" (gera indicador)
      if (dist > detectRadius) continue;

      // delay proporcional à distância, como se a onda viajasse no mapa
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
