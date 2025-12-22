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

  function ensureOtherPlayer(id, idx = 0) {
    if (players.has(id)) return players.get(id);

    const col = idx % 10;
    const row = Math.floor(idx / 10);

    const p = createPlayer({
      x: 50 + col * 60,
      y: 50 + row * 60,
      color: otherColor,
    });

    players.set(id, p);
    return p;
  }

  function ensurePlayersFromIds(ids) {
    ids.forEach((id, idx) => {
      if (id === myId) return;
      ensureOtherPlayer(id, idx);
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
      ensurePlayersFromIds(ids);
    },

    setMoveTarget(x, y) {
      const maxX = world.width - localPlayer.size;
      const maxY = world.height - localPlayer.size;
      localPlayer.setTarget(clamp(x, 0, maxX), clamp(y, 0, maxY));
    },

    setPlayerPosition(id, x, y) {
      if (id === myId) return;

      const other = ensureOtherPlayer(id);
      const maxX = world.width - other.size;
      const maxY = world.height - other.size;
      other.setPosition(clamp(x, 0, maxX), clamp(y, 0, maxY));
    },

    getMyPosition() {
      if (!myId) return null;
      return { x: localPlayer.x, y: localPlayer.y };
    },

    // ✅ adiciona feedback de clique (local)
    addClickFeedback(x, y) {
      clickEffects.push({
        x,
        y,
        age: 0,
        ttl: 0.35, // segundos (fade rápido)
        radius: 14, // em unidades do mundo
      });
    },

    getClickEffects() {
      return clickEffects;
    },

    update(dt) {
      localPlayer.update(dt);

      // clamp do player local sem cancelar o target
      const maxX = world.width - localPlayer.size;
      const maxY = world.height - localPlayer.size;
      localPlayer.clampPosition(0, 0, maxX, maxY);

      // update efeitos
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
