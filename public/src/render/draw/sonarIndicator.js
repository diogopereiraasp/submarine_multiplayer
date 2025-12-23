export function drawSonarIndicator(ctx, { centerX, centerY, radiusPx, angleRad, alpha, sizePx = 10 }) {
  const a = Math.max(0, Math.min(1, alpha));
  if (a <= 0) return;

  const tipX = centerX + Math.cos(angleRad) * radiusPx;
  const tipY = centerY + Math.sin(angleRad) * radiusPx;

  const base = sizePx;
  const half = sizePx * 0.65;

  // Triângulo apontando pra direção do evento
  const backX = tipX - Math.cos(angleRad) * base;
  const backY = tipY - Math.sin(angleRad) * base;

  const leftX = backX + Math.cos(angleRad + Math.PI / 2) * half;
  const leftY = backY + Math.sin(angleRad + Math.PI / 2) * half;

  const rightX = backX + Math.cos(angleRad - Math.PI / 2) * half;
  const rightY = backY + Math.sin(angleRad - Math.PI / 2) * half;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(leftX, leftY);
  ctx.lineTo(rightX, rightY);
  ctx.closePath();

  ctx.fillStyle = `rgba(210,193,182,${a * 0.8})`;
  ctx.fill();

  ctx.restore();
}
