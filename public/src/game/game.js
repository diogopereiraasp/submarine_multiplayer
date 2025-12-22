import { createGameLoop } from "./loop.js";
import { createPlayer } from "../entities/player.js";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function createGame({ myColor, otherColor, world }) {
  let myId = null;

  const players = new Map(); // id -> player
  const localPlayer = createPlayer({ x: 100, y: 100, color: myColor });

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

    update(dt) {
      localPlayer.update(dt);

      // ✅ não usar setPosition aqui (senão cancela target e anda "um passo")
      const maxX = world.width - localPlayer.size;
      const maxY = world.height - localPlayer.size;
      localPlayer.clampPosition(0, 0, maxX, maxY);
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
