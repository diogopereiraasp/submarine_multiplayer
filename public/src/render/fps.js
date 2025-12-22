export function createFpsMeter({ sampleMs = 500 } = {}) {
  let lastSampleAt = performance.now();
  let frames = 0;
  let fps = 0;

  function update(now) {
    frames += 1;

    const elapsed = now - lastSampleAt;
    if (elapsed >= sampleMs) {
      fps = (frames * 1000) / elapsed;
      frames = 0;
      lastSampleAt = now;
    }
  }

  function draw(ctx, canvas) {
    const text = `${Math.round(fps)} FPS`;

    ctx.save();
    // desenha em coordenadas de tela (não mexe no grid/câmera)
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.font = "10px system-ui, Arial, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.45)";

    ctx.fillText(text, canvas.width - 8, 8);
    ctx.restore();
  }

  return { update, draw };
}
