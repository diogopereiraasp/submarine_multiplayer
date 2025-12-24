import { createGameLoop } from "./loop.js";
import { createPlayer } from "../entities/player.js";
import { clamp } from "../utils/math.js";
import { CONFIG } from "./config.js";

export function createGame({ myColor, otherColor, world }) {
  let myId = null;
  let hasServerSpawn = false;

  const players = new Map(); // id -> player
  const localPlayer = createPlayer({ x: 100, y: 100, color: myColor });

  // efeitos locais
  const clickEffects = [];

  // ===== SONAR (ondas locais + envio server) =====
  const sonarWaves = []; // { x, y, age }
  const sonarOutbox = []; // { x, y }
  let sonarCooldown = 0;

  // indicadores (direção)
  const sonarIndicators = []; // { angle, age, ttl, kind }

  function getSonarConfig() {
    const cfg = world?.sonar ?? {};
    return {
      maxRadius: typeof cfg.maxRadius === "number" ? cfg.maxRadius : 1800,
      speed: typeof cfg.speed === "number" ? cfg.speed : 900,
      emitEvery: typeof cfg.emitEvery === "number" ? cfg.emitEvery : 0.35,
    };
  }

  function ensurePlayer(id) {
    if (id === myId) return null;

    if (!players.has(id)) {
      players.set(
        id,
        createPlayer({
          x: 200,
          y: 200,
          color: otherColor,
        })
      );
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
      if (!id) return;

      // aplica spawn inicial do próprio player vindo do servidor (apenas 1x)
      if (id === myId && !hasServerSpawn) {
        if (typeof localPlayer.setPosition === "function") {
          localPlayer.setPosition(x, y);
        } else {
          try {
            localPlayer.x = x;
            localPlayer.y = y;
          } catch {
            // noop
          }
        }
        hasServerSpawn = true;
        return;
      }

      if (id === myId) return;

      const p = ensurePlayer(id);
      if (!p) return;

      if (typeof p.setPosition === "function") {
        p.setPosition(x, y);
        return;
      }

      try {
        p.x = x;
        p.y = y;
      } catch {
        // noop
      }
    },

    setMoveTarget(x, y) {
      const tx = clamp(x, 0, world.width - localPlayer.size);
      const ty = clamp(y, 0, world.height - localPlayer.size);

      if (typeof localPlayer.setTarget === "function") {
        localPlayer.setTarget(tx, ty);
        return;
      }

      localPlayer.targetX = tx;
      localPlayer.targetY = ty;
      localPlayer.moving = true;
    },

    getMyPosition() {
      return { x: localPlayer.x, y: localPlayer.y };
    },

    isSpawned() {
      return hasServerSpawn;
    },

    // ===== CLICK FEEDBACK =====
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
      const { speed, maxRadius } = getSonarConfig();
      return sonarWaves.map((w) => ({
        x: w.x,
        y: w.y,
        radius: w.age * speed,
        maxRadius,
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
      const prevX = localPlayer.x;
      const prevY = localPlayer.y;

      if (typeof localPlayer.update === "function") {
        localPlayer.update(dt);
      }

      const moved = Math.hypot(localPlayer.x - prevX, localPlayer.y - prevY);
      const { emitEvery, speed, maxRadius } = getSonarConfig();

      sonarCooldown -= dt;

      if (moved > 0.05 && sonarCooldown <= 0) {
        const ox = localPlayer.x + localPlayer.size / 2;
        const oy = localPlayer.y + localPlayer.size / 2;

        sonarWaves.push({ x: ox, y: oy, age: 0 });
        sonarOutbox.push({ x: ox, y: oy });

        sonarCooldown = emitEvery;
      }

      for (let i = sonarWaves.length - 1; i >= 0; i--) {
        const w = sonarWaves[i];
        w.age += dt;
        if (w.age * speed >= maxRadius) sonarWaves.splice(i, 1);
      }

      for (let i = sonarIndicators.length - 1; i >= 0; i--) {
        const it = sonarIndicators[i];
        it.age += dt;
        if (it.age >= it.ttl) sonarIndicators.splice(i, 1);
      }

      for (let i = clickEffects.length - 1; i >= 0; i--) {
        const fx = clickEffects[i];
        fx.age += dt;
        if (fx.age >= fx.ttl) clickEffects.splice(i, 1);
      }
    },

    getRenderablePlayers() {
      if (!CONFIG.showOtherPlayers) return [localPlayer];
      return [localPlayer, ...Array.from(players.values())];
    },

    start(frameCallback) {
      onFrame = frameCallback;
      loop.start();
    },
  };
}
