export function setupInput(canvas, game, renderer) {
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldPos = renderer.screenToWorld(screenX, screenY);
    if (!worldPos) return;

    game.setMoveTarget(worldPos.x, worldPos.y);
  });
}
