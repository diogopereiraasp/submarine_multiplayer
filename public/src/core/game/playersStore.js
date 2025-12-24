export function createPlayersStore({ createPlayer, otherColor }) {
  const players = new Map(); // id -> player

  function ensurePlayer(id, myId) {
    if (!id || id === myId) return null;

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

  return {
    applyConnectedIds({ ids, myId }) {
      ids.forEach((id) => ensurePlayer(id, myId));

      for (const id of Array.from(players.keys())) {
        if (!ids.includes(id)) players.delete(id);
      }
    },

    setRemotePlayerPosition({ id, x, y, myId }) {
      const p = ensurePlayer(id, myId);
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

    getAll() {
      return Array.from(players.values());
    },
  };
}
