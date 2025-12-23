import { createPlayer } from "../entities/player.js";

/**
 * Store de players remotos.
 * Contrato:
 * - setConnectedIds(ids): cria/remove remotos
 * - setPlayerPosition(id,x,y): aplica posição recebida do servidor
 * - list(): retorna array de players remotos renderizáveis
 */
export function createPlayersStore({ otherColor }) {
  const players = new Map(); // id -> player

  function ensure(id) {
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

  function setConnectedIds(ids, myId) {
    ids.forEach((id) => {
      if (id && id !== myId) ensure(id);
    });

    for (const id of Array.from(players.keys())) {
      if (!ids.includes(id)) players.delete(id);
    }
  }

  function setPlayerPosition(id, myId, x, y) {
    if (!id || id === myId) return;

    const p = ensure(id);
    if (!p) return;

    if (typeof p.setPosition === "function") {
      p.setPosition(x, y);
      return;
    }

    // fallback (se vier um player com getters apenas, não quebra)
    try {
      p.x = x;
      p.y = y;
    } catch {
      // noop
    }
  }

  function list() {
    return Array.from(players.values());
  }

  return {
    setConnectedIds,
    setPlayerPosition,
    list,
  };
}
