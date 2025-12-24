import { createGameLoop } from "./loop.js";
import { createPlayer } from "../entities/player.js";
import { clamp } from "../utils/math.js";
import { CONFIG } from "./config.js";

import { createPlayersStore } from "./game/playersStore.js";
import { createConnectedIdsStore } from "./game/connectedIdsStore.js";
import { createClickFeedbackSystem } from "./game/clickFeedbackSystem.js";
import { createSonarSystem } from "./game/sonarSystem.js";

export function createGame({ myColor, otherColor, world }) {
  let myId = null;
  let hasServerSpawn = false;

  const localPlayer = createPlayer({ x: 100, y: 100, color: myColor });

  const connected = createConnectedIdsStore();
  const playersStore = createPlayersStore({ createPlayer, otherColor });
  const clickFx = createClickFeedbackSystem();
  const sonar = createSonarSystem({ world });

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
      connected.set(ids);
      playersStore.applyConnectedIds({ ids: connected.get(), myId });
    },

    getConnectedCount() {
      return connected.get().length;
    },

    getOverlayPlayerIds({ maxChars = 6, maxLines = 12 } = {}) {
      return connected.getOverlayIds({ maxChars, maxLines });
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

      playersStore.setRemotePlayerPosition({ id, x, y, myId });
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
      clickFx.add(x, y);
    },

    getClickEffects() {
      return clickFx.get();
    },

    // ===== SONAR =====
    consumeSonarOutbox() {
      return sonar.consumeOutbox();
    },

    getSonarWaves() {
      return sonar.getWaves();
    },

    onSonarHit({ angle }) {
      sonar.onHit({ angle });
    },

    onSonarConfirm({ angle }) {
      sonar.onConfirm({ angle });
    },

    getSonarIndicators() {
      return sonar.getIndicators();
    },

    update(dt) {
      const prevX = localPlayer.x;
      const prevY = localPlayer.y;

      if (typeof localPlayer.update === "function") {
        localPlayer.update(dt);
      }

      sonar.update({ dt, player: localPlayer, prevX, prevY });
      clickFx.update(dt);
    },

    getRenderablePlayers() {
      if (!CONFIG.showOtherPlayers) return [localPlayer];
      return [localPlayer, ...playersStore.getAll()];
    },

    start(frameCallback) {
      onFrame = frameCallback;
      loop.start();
    },
  };
}
