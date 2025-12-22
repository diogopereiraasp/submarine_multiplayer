import { drawPlayer } from "./draw/player.js";

export function createRenderer(canvas, { backgroundColor }) {
  const ctx = canvas.getContext("2d");

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
  }

  window.addEventListener("resize", resize);
  resize();

  return {
    clear() {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    drawGame(game) {
      const players = game.getRenderablePlayers();
      players.forEach((p) => drawPlayer(ctx, p));
    },
  };
}
