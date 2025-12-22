export function setupInput(canvas, game, renderer) {
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldPos = renderer.screenToWorld(screenX, screenY);
    if (!worldPos) return;

    // ✅ feedback visual local (cada jogador vê apenas o próprio clique)
    game.addClickFeedback(worldPos.x, worldPos.y);

    // movimento
    game.setMoveTarget(worldPos.x, worldPos.y);
  });
}
