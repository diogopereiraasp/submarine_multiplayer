import { EVENTS } from "./events.js";

/**
 * Conexão Socket.IO com contrato mínimo.
 * - Não acessa DOM
 * - Não depende de renderer
 * - Só traduz eventos em callbacks
 */
export function createSocketClient({
  ioFactory = () => io(),
  onConnectId,
  onConnectedIds,
  onPlayersState,
  onPlayerState,
  onSonarHit,
  onSonarConfirm,
} = {}) {
  const socket = ioFactory();

  socket.on("connect", () => {
    onConnectId?.(socket.id);
  });

  socket.on(EVENTS.CONNECTED_IDS, (ids) => {
    onConnectedIds?.(ids);
  });

  socket.on(EVENTS.PLAYERS_STATE, (list) => {
    onPlayersState?.(list);
  });

  socket.on(EVENTS.PLAYER_STATE, (payload) => {
    onPlayerState?.(payload);
  });

  socket.on(EVENTS.SONAR_HIT, (payload) => {
    onSonarHit?.(payload);
  });

  socket.on(EVENTS.SONAR_CONFIRM, (payload) => {
    onSonarConfirm?.(payload);
  });

  return {
    get id() {
      return socket.id;
    },

    sendPlayerState(pos) {
      socket.emit(EVENTS.PLAYER_STATE, pos);
    },

    emitSonar(pulse) {
      socket.emit(EVENTS.SONAR_EMIT, pulse);
    },

    raw() {
      return socket;
    },
  };
}
