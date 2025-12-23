import { createGameLoop } from "./loop.js";
import { createPlayer } from "../entities/player.js";
import { clamp } from "../utils/math.js";
import { createPlayersStore } from "./playersStore.js";
import { createSonarSystem } from "./sonarSystem.js";
import { createEffects } from "./effects.js";

export function createGame({ myColor, otherColor, world }) {
  let myId = null;

  const localPlayer = createPlayer({ x: 100, y: 100, color: myColor });

  const remotes = createPlayersStore({ otherColor });
  const sonar = createSonarSystem(world);
  const effects = createEffects();

  let onFrame = null;
  const loop = createGameLoop((payload) => onFrame?.(payload));

  function getCenter() {
    return {
      cx: localPlayer.x + localPlayer.size / 2,
      cy: localPlayer.y + localPlayer.size / 2,
    };
  }

  return {
    getMyPlayer() {
      return localPlayer;
    },

    setMyId(id) {
      myId = id;
    },

    setConnectedIds(ids) {
      remotes.setConnectedIds(ids, myId);
    },

    setPlayerPosition(id, x, y) {
      remotes.setPlayerPosition(id, myId, x, y);
    },

    setMoveTarget(x, y) {
      const tx = clamp(x, 0, world.width - localPlayer.size);
      const ty = clamp(y, 0, world.height - localPlayer.size);

      if (typeof localPlayer.setTarget === "function") {
        localPlayer.setTarget(tx, ty);
      } else {
        localPlayer.targetX = tx;
        localPlayer.targetY = ty;
        localPlayer.moving = true;
      }
    },

    addClickFeedback(x, y) {
      effects.add(x, y);
    },

    getClickEffects() {
      return effects.list();
    },

    consumeSonarOutbox() {
      return sonar.consumeOutbox();
    },

    getSonarWaves() {
      return sonar.getWaves();
    },

    onSonarHit(payload) {
      sonar.onHit(payload);
    },

    onSonarConfirm(payload) {
      sonar.onConfirm(payload);
    },

    getSonarIndicators() {
      return sonar.getIndicators();
    },

    getMyPosition() {
      return { x: localPlayer.x, y: localPlayer.y };
    },

    update(dt) {
      const prevX = localPlayer.x;
      const prevY = localPlayer.y;

      if (typeof localPlayer.update === "function") {
        localPlayer.update(dt);
      }

      const moved = Math.hypot(localPlayer.x - prevX, localPlayer.y - prevY);
      const { cx, cy } = getCenter();

      sonar.update(dt, moved, cx, cy);
      effects.update(dt);
    },

    getRenderablePlayers() {
      return [localPlayer, ...remotes.list()];
    },

    start(frameCallback) {
      onFrame = frameCallback;
      loop.start();
    },
  };
}
