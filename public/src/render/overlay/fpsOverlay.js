import { CONFIG } from "../../core/config.js";

export function createFpsOverlay({ ctx, fpsMeter }) {
  function draw({ originX, originY, viewportPx }) {
    if (CONFIG.visuals?.fps?.enabled === false) return;

    const fps = Math.round(fpsMeter.getFps?.() ?? 0);
    const text = `${fps} FPS`;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.font = "10px system-ui, Arial, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.45)";

    ctx.fillText(text, originX + viewportPx - 8, originY + 8);
    ctx.restore();
  }

  return { draw };
}
