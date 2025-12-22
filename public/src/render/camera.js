function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function createCamera({ world, viewWidth }) {
  const state = {
    x: world.width / 2,
    y: world.height / 2,
    scale: 1,

    viewWidth,
    viewHeight: viewWidth,
    baseViewWidth: viewWidth,
  };

  return {
    get x() {
      return state.x;
    },
    get y() {
      return state.y;
    },
    get scale() {
      return state.scale;
    },
    get viewWidth() {
      return state.viewWidth;
    },
    get viewHeight() {
      return state.viewHeight;
    },

    // ✅ câmera sempre quadrada (mesma área para todo mundo)
    update({ targetX, targetY, viewportPx }) {
      state.viewWidth = state.baseViewWidth;
      state.viewHeight = state.baseViewWidth; // quadrado
      state.scale = viewportPx / state.viewWidth;

      const halfW = state.viewWidth / 2;
      const halfH = state.viewHeight / 2;

      const minX = halfW;
      const maxX = world.width - halfW;
      const minY = halfH;
      const maxY = world.height - halfH;

      const centerX = world.width / 2;
      const centerY = world.height / 2;

      state.x = world.width <= state.viewWidth ? centerX : clamp(targetX, minX, maxX);
      state.y = world.height <= state.viewHeight ? centerY : clamp(targetY, minY, maxY);
    },

    screenToWorld({ screenX, screenY, viewportPx }) {
      const viewW = state.viewWidth;
      const viewH = state.viewHeight;

      const worldLeft = state.x - viewW / 2;
      const worldTop = state.y - viewH / 2;

      const worldX = worldLeft + (screenX / viewportPx) * viewW;
      const worldY = worldTop + (screenY / viewportPx) * viewH;

      return { x: worldX, y: worldY };
    },
  };
}
