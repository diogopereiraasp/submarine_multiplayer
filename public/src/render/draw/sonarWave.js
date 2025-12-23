export function drawSonarWave(ctx, { x, y, radius, alpha, thickness }) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  ctx.strokeStyle = `rgba(210,193,182,${Math.max(0, Math.min(1, alpha))})`;
  ctx.lineWidth = thickness;

  ctx.stroke();
  ctx.restore();
}
