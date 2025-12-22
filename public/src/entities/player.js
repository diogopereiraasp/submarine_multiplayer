export function createPlayer({ x, y, color }) {
  const state = {
    x,
    y,
    size: 30,
    speed: 300, // px/s
    targetX: x,
    targetY: y,
    color,
  };

  return {
    get x() { return state.x; },
    get y() { return state.y; },
    get size() { return state.size; },
    get color() { return state.color; },

    setTarget(x, y) {
      state.targetX = x;
      state.targetY = y;
    },

    // usado para sincronização em tempo real (teleporta e fixa o target)
    setPosition(x, y) {
      state.x = x;
      state.y = y;
      state.targetX = x;
      state.targetY = y;
    },

    // ✅ clampa posição sem cancelar o movimento atual
    clampPosition(minX, minY, maxX, maxY) {
      if (state.x < minX) state.x = minX;
      if (state.y < minY) state.y = minY;
      if (state.x > maxX) state.x = maxX;
      if (state.y > maxY) state.y = maxY;
    },

    update(dt) {
      const dx = state.targetX - state.x;
      const dy = state.targetY - state.y;

      const dist = Math.hypot(dx, dy);
      if (dist < 1) return;

      const maxStep = state.speed * dt;
      const step = Math.min(maxStep, dist);

      state.x += (dx / dist) * step;
      state.y += (dy / dist) * step;
    },
  };
}
