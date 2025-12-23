export function createGameLoop(onFrame) {
  let last = performance.now();
  let running = false;

  function frame(now) {
    if (!running) return;

    const dt = (now - last) / 1000;
    last = now;

    onFrame({ dt, now });

    requestAnimationFrame(frame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    },
    stop() {
      running = false;
    },
  };
}
