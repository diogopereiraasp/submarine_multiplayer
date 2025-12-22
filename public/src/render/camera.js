function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function createCamera({ world, viewWidth }) {
  const state = {
    x: 0,
    y: 0,
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

    update({ targetX, targetY, canvasWidth, canvasHeight }) {
      // mesma área de mundo na horizontal, independente do tamanho do canvas
      state.viewWidth = state.baseViewWidth;
      state.viewHeight = state.viewWidth * (canvasHeight / canvasWidth);
      state.scale = canvasWidth / state.viewWidth;

      const halfW = state.viewWidth / 2;
      const halfH = state.viewHeight / 2;

      const minX = halfW;
      const maxX = world.width - halfW;
      const minY = halfH;
      const maxY = world.height - halfH;

      // se o mapa for menor que a view, centraliza
      const centerX = world.width / 2;
      const centerY = world.height / 2;

      state.x = world.width <= state.viewWidth ? centerX : clamp(targetX, minX, maxX);
      state.y = world.height <= state.viewHeight ? centerY : clamp(targetY, minY, maxY);
    },

    screenToWorld({ screenX, screenY, canvasWidth, canvasHeight }) {
      const viewW = state.viewWidth;
      const viewH = state.viewHeight;

      const worldLeft = state.x - viewW / 2;
      const worldTop = state.y - viewH / 2;

      const worldX = worldLeft + (screenX / canvasWidth) * viewW;
      const worldY = worldTop + (screenY / canvasHeight) * viewH;

      return { x: worldX, y: worldY };
    },
  };
}
