export function setupInput(canvas, game, socket) {
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    game.setMoveTarget(x, y);
    socket.emit("move_to", { x, y });
  });
}
