import { createGameLoop } from "./loop.js";
import { createPlayer } from "../entities/player.js";

export function createGame({ myColor, otherColor }) {
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
    setMyId(id) {
      myId = id;
    },

    setConnectedIds(ids) {
      ensurePlayersFromIds(ids);
    },

    setMoveTarget(x, y) {
      localPlayer.setTarget(x, y);
    },

    // usado para atualizar posição em tempo real (recebido via socket)
    setPlayerPosition(id, x, y) {
      if (id === myId) return;

      const other = ensureOtherPlayer(id);
      other.setPosition(x, y); // posição instantânea
    },

    getMyPosition() {
      if (!myId) return null;
      return { x: localPlayer.x, y: localPlayer.y };
    },

    update(dt) {
      localPlayer.update(dt);
      // outros players agora recebem posição pronta, não precisam de update
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
