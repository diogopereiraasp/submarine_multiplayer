export function createViewport(canvas) {
  function get() {
    const viewportPx = Math.min(canvas.width, canvas.height);
    const originX = Math.floor((canvas.width - viewportPx) / 2);
    const originY = Math.floor((canvas.height - viewportPx) / 2);
    return { viewportPx, originX, originY };
  }

  function screenToWorld(camera, screenX, screenY, vp = get()) {
    const { viewportPx, originX, originY } = vp;

    const localX = screenX - originX;
    const localY = screenY - originY;

    if (localX < 0 || localY < 0 || localX > viewportPx || localY > viewportPx) {
      return null;
    }

    return camera.screenToWorld({
      screenX: localX,
      screenY: localY,
      viewportPx,
    });
  }

  return { get, screenToWorld };
}
