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

  function getFps() {
    return fps;
  }

  return { update, getFps };
}
