import { drawSonarIndicator } from "../draw/sonarIndicator.js";

export function createSonarIndicatorsOverlay({ ctx }) {
  function draw(game, { originX, originY, viewportPx }) {
    const indicators = game.getSonarIndicators?.() ?? [];
    if (!indicators.length) return;

    const cx = originX + viewportPx / 2;
    const cy = originY + viewportPx / 2;
    const radiusPx = viewportPx * 0.47;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    indicators.forEach((it) => {
      const a = 1 - it.age / it.ttl;
      drawSonarIndicator(ctx, {
        centerX: cx,
        centerY: cy,
        radiusPx,
        angleRad: it.angle,
        alpha: a,
        sizePx: 10,
      });
    });

    ctx.restore();
  }

  return { draw };
}
