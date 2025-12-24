export function createGridDrawer({ ctx, camera, world, gridRgb }) {
  return function drawGrid() {
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
  };
}
