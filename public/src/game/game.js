import { createGameLoop } from "./loop.js";
import { createPlayer } from "../entities/player.js";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function createGame({ myColor, otherColor, world }) {
  let myId = null;

  const players = new Map(); // id -> player
  const localPlayer = createPlayer({ x: 100, y: 100, color: myColor });

  // ✅ efeitos locais (não sincroniza por rede)
  const clickEffects = [];

  // ✅ sonar local (ondas só do jogador)
  const sonarWaves = []; // { x, y, age }
  const sonarOutbox = []; // { x, y } para enviar ao server
  let sonarCooldown = 0;

  // ✅ indicadores de direção (overlay)
  const sonarIndicators = []; // { angle, age, ttl, kind }

  function ensurePlayer(id) {
    if (id === myId) return null;
    if (!players.has(id)) {
      players.set(id, createPlayer({ x: 200, y: 200, color: otherColor }));
    }
    return players.get(id);
  }

  function applyConnectedIds(ids) {
    ids.forEach((id) => {
      if (id !== myId) ensurePlayer(id);
    });

    for (const id of Array.from(players.keys())) {
      if (!ids.includes(id)) players.delete(id);
    }
  }

  let onFrame = null;
  const loop = createGameLoop((payload) => onFrame?.(payload));

  return {
    getMyPlayer() {
      return localPlayer;
    },

    setMyId(id) {
      myId = id;
    },

    setConnectedIds(ids) {
      applyConnectedIds(ids);
    },

    setPlayerPosition(id, x, y) {
      if (!id || id === myId) return;
      const p = ensurePlayer(id);
      if (!p) return;
      p.setPosition(x, y);
    },

    setMoveTarget(x, y) {
      const tx = clamp(x, 0, world.width - localPlayer.size);
      const ty = clamp(y, 0, world.height - localPlayer.size);
      localPlayer.setTarget(tx, ty);
    },

    getMyPosition() {
      return { x: localPlayer.x, y: localPlayer.y };
    },

    // ===== CLICK FEEDBACK (necessário pro mouse.js) =====
    addClickFeedback(x, y) {
      clickEffects.push({
        x,
        y,
        age: 0,
        ttl: 0.35,
        radius: 14,
      });
    },

    getClickEffects() {
      return clickEffects;
    },

    // ===== SONAR =====
    consumeSonarOutbox() {
      const batch = sonarOutbox.slice();
      sonarOutbox.length = 0;
      return batch;
    },

    getSonarWaves() {
      return sonarWaves.map((w) => ({
        x: w.x,
        y: w.y,
        radius: w.age * world.sonar.speed,
        maxRadius: world.sonar.maxRadius,
      }));
    },

    onSonarHit({ angle }) {
      if (typeof angle !== "number") return;
      sonarIndicators.push({ angle, age: 0, ttl: 0.9, kind: "hit" });
    },

    onSonarConfirm({ angle }) {
      if (typeof angle !== "number") return;
      sonarIndicators.push({ angle, age: 0, ttl: 0.6, kind: "confirm" });
    },

    getSonarIndicators() {
      return sonarIndicators;
    },

    update(dt) {
      // movimento local
      const prevX = localPlayer.x;
      const prevY = localPlayer.y;

      localPlayer.update(dt);

      // auto sonar enquanto move
      const moved = Math.hypot(localPlayer.x - prevX, localPlayer.y - prevY);

      sonarCooldown -= dt;
      if (moved > 0.05 && sonarCooldown <= 0) {
        const ox = localPlayer.x + localPlayer.size / 2;
        const oy = localPlayer.y + localPlayer.size / 2;

        sonarWaves.push({ x: ox, y: oy, age: 0 });
        sonarOutbox.push({ x: ox, y: oy });

        sonarCooldown = world.sonar.emitEvery;
      }

      // ondas
      for (let i = sonarWaves.length - 1; i >= 0; i--) {
        const w = sonarWaves[i];
        w.age += dt;
        if (w.age * world.sonar.speed >= world.sonar.maxRadius) {
          sonarWaves.splice(i, 1);
        }
      }

      // indicadores
      for (let i = sonarIndicators.length - 1; i >= 0; i--) {
        const it = sonarIndicators[i];
        it.age += dt;
        if (it.age >= it.ttl) sonarIndicators.splice(i, 1);
      }

      // click feedback
      for (let i = clickEffects.length - 1; i >= 0; i--) {
        const fx = clickEffects[i];
        fx.age += dt;
        if (fx.age >= fx.ttl) clickEffects.splice(i, 1);
      }
    },

    getRenderablePlayers() {
      return [localPlayer, ...Array.from(players.values())];
    },

    start(frameCallback) {
      onFrame = frameCallback;
      loop.start();
    },
  };
}
