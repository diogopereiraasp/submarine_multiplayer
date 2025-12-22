export function setupInput(canvas, game, renderer) {
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const { x, y } = renderer.screenToWorld(screenX, screenY);
    game.setMoveTarget(x, y);
  });
}
