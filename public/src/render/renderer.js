import { drawPlayer } from "./draw/player.js";
import { createCamera } from "./camera.js";
import { createFpsMeter } from "./fps.js";

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return null;
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function mixWithWhite({ r, g, b }, t) {
  return {
    r: Math.round(r + (255 - r) * t),
    g: Math.round(g + (255 - g) * t),
    b: Math.round(b + (255 - b) * t),
  };
}

export function createRenderer(canvas, { backgroundColor, world }) {
  const ctx = canvas.getContext("2d");
  const camera = createCamera({ world, viewWidth: world.viewWidth });
  const fpsMeter = createFpsMeter({ sampleMs: 500 });

  const baseRgb = hexToRgb(backgroundColor) ?? { r: 255, g: 255, b: 255 };
  const gridRgb = mixWithWhite(baseRgb, 0.12); // levemente mais claro que o fundo

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
  }

  window.addEventListener("resize", resize);
  resize();

  function getViewport() {
    const viewportPx = Math.min(canvas.width, canvas.height);
    const originX = Math.floor((canvas.width - viewportPx) / 2);
    const originY = Math.floor((canvas.height - viewportPx) / 2);
    return { viewportPx, originX, originY };
  }

  function drawGrid() {
    const gridSize = world.gridSize ?? 100;

    const left = camera.x - camera.viewWidth / 2;
    const right = camera.x + camera.viewWidth / 2;
    const top = camera.y - camera.viewHeight / 2;
    const bottom = camera.y + camera.viewHeight / 2;

    const startX = Math.floor(left / gridSize) * gridSize;
    const endX = Math.ceil(right / gridSize) * gridSize;
    const startY = Math.floor(top / gridSize) * gridSize;
    const endY = Math.ceil(bottom / gridSize) * gridSize;

    ctx.strokeStyle = `rgba(${gridRgb.r},${gridRgb.g},${gridRgb.b},0.28)`;
    ctx.lineWidth = 1 / camera.scale;

    ctx.beginPath();

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }

    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }

    ctx.stroke();
  }

  return {
    getCamera() {
      return camera;
    },

    // ✅ agora considera viewport quadrado centralizado
    screenToWorld(screenX, screenY) {
      const { viewportPx, originX, originY } = getViewport();

      const localX = screenX - originX;
      const localY = screenY - originY;

      if (localX < 0 || localY < 0 || localX > viewportPx || localY > viewportPx) {
        return null;
      }

      return camera.screenToWorld({
        screenX: localX,
        screenY: localY,
        viewportPx,
      });
    },

    clear() {
      // fundo do canvas inteiro
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    drawGame(game) {
      fpsMeter.update(performance.now());

      const { viewportPx, originX, originY } = getViewport();

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

      // ✅ desenha o mundo dentro do viewport quadrado (letterbox fora)
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

      drawGrid();

      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 4 / camera.scale;
      ctx.strokeRect(0, 0, world.width, world.height);

      const players = game.getRenderablePlayers();
      players.forEach((p) => drawPlayer(ctx, p));

      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // ✅ FPS no canto superior direito DO viewport (não do canvas inteiro)
      fpsMeter.draw(ctx, { x: originX + viewportPx - 8, y: originY + 8 });
    },
  };
}
