import { drawPlayer } from "./draw/player.js";
import { createCamera } from "./camera.js";

export function createRenderer(canvas, { backgroundColor, world }) {
  const ctx = canvas.getContext("2d");
  const camera = createCamera({ world, viewWidth: world.viewWidth });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
  }

  window.addEventListener("resize", resize);
  resize();

  return {
    getCamera() {
      return camera;
    },

    screenToWorld(screenX, screenY) {
      return camera.screenToWorld({
        screenX,
        screenY,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });
    },

    clear() {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    drawGame(game) {
      const me = game.getMyPlayer();
      if (me) {
        camera.update({
          targetX: me.x + me.size / 2,
          targetY: me.y + me.size / 2,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
        });
      }

      ctx.save();
      ctx.setTransform(
        camera.scale,
        0,
        0,
        camera.scale,
        canvas.width / 2 - camera.x * camera.scale,
        canvas.height / 2 - camera.y * camera.scale
      );

      // limites do mapa
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, world.width, world.height);

      const players = game.getRenderablePlayers();
      players.forEach((p) => drawPlayer(ctx, p));
      ctx.restore();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
  };
}
