export function attachCanvasResize(canvas) {
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
  }

  window.addEventListener("resize", resize);
  resize();

  return () => window.removeEventListener("resize", resize);
}
