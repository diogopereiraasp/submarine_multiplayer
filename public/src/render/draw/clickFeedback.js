export function drawClickFeedback(ctx, effect) {
  const t = effect.age / effect.ttl; // 0..1
  const alpha = Math.max(0, 1 - t);

  const radius = effect.radius;
  const thickness = effect.thickness;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = effect.color;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
