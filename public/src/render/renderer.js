import { drawPlayer } from "./draw/player.js";
import { createCamera } from "./camera.js";
import { createFpsMeter } from "./fps.js";
import { drawClickFeedback } from "./draw/clickFeedback.js";
import { drawSonarWave } from "./draw/sonarWave.js";
import { CONFIG } from "../core/config.js";

import { hexToRgb, mixWithWhite } from "./utils/colors.js";
import { attachCanvasResize } from "./utils/canvasResize.js";
import { createViewport } from "./viewport.js";
import { createGridDrawer } from "./draw/grid.js";
import { createFpsOverlay } from "./overlay/fpsOverlay.js";
import { createSonarIndicatorsOverlay } from "./overlay/sonarIndicatorsOverlay.js";

export function createRenderer(canvas, { backgroundColor, world }) {
  const ctx = canvas.getContext("2d");
  const camera = createCamera({ world, viewWidth: world.viewWidth });
  const fpsMeter = createFpsMeter({ sampleMs: 500 });

  const baseRgb = hexToRgb(backgroundColor) ?? { r: 255, g: 255, b: 255 };
  const gridRgb = mixWithWhite(baseRgb, 0.12);

  attachCanvasResize(canvas);
  const viewport = createViewport(canvas);

  const drawGrid = createGridDrawer({ ctx, camera, world, gridRgb });
  const fpsOverlay = createFpsOverlay({ ctx, fpsMeter });
  const sonarIndicatorsOverlay = createSonarIndicatorsOverlay({ ctx });

  return {
    getCamera() {
      return camera;
    },

    screenToWorld(screenX, screenY) {
      const vp = viewport.get();
      return viewport.screenToWorld(camera, screenX, screenY, vp);
    },

    clear() {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    drawGame(game) {
      fpsMeter.update(performance.now());

      const vp = viewport.get();
      const { viewportPx, originX, originY } = vp;

      const me = game.getMyPlayer?.();
      if (me) {
        camera.update({
          targetX: me.x + me.size / 2,
          targetY: me.y + me.size / 2,
          viewportPx,
        });
      } else {
        camera.update({
          targetX: world.width / 2,
          targetY: world.height / 2,
          viewportPx,
        });
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(originX, originY, viewportPx, viewportPx);
      ctx.clip();

      ctx.setTransform(
        camera.scale,
        0,
        0,
        camera.scale,
        originX + viewportPx / 2 - camera.x * camera.scale,
        originY + viewportPx / 2 - camera.y * camera.scale
      );

      if (CONFIG.visuals?.grid?.enabled !== false) drawGrid();

      // SONAR (ondas locais apenas)
      const waves = game.getSonarWaves?.() ?? [];
      waves.forEach((w) => {
        const alpha = 1 - w.radius / w.maxRadius;
        if (alpha <= 0) return;

        drawSonarWave(ctx, {
          x: w.x,
          y: w.y,
          radius: w.radius,
          alpha: alpha * 0.15,
          thickness: 2 / camera.scale,
        });
      });

      // click feedback local
      const clickEffects = game.getClickEffects?.() ?? [];
      clickEffects.forEach((fx) => {
        drawClickFeedback(ctx, {
          x: fx.x,
          y: fx.y,
          age: fx.age,
          ttl: fx.ttl,
          radius: fx.radius,
          color: me?.color ?? "#D2C1B6",
          thickness: 2 / camera.scale,
        });
      });

      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 4 / camera.scale;
      ctx.strokeRect(0, 0, world.width, world.height);

      const players = game.getRenderablePlayers();
      players.forEach((p) => drawPlayer(ctx, p));

      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      sonarIndicatorsOverlay.draw(game, vp);
      fpsOverlay.draw(vp);
    },
  };
}
