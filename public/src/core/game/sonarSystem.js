export function createSonarSystem({ world }) {
  const sonarWaves = []; // { x, y, age }
  const sonarOutbox = []; // { x, y }
  let sonarCooldown = 0;

  const indicators = []; // { angle, age, ttl, kind }

  function getConfig() {
    const cfg = world?.sonar ?? {};
    return {
      maxRadius: typeof cfg.maxRadius === "number" ? cfg.maxRadius : 1800,
      speed: typeof cfg.speed === "number" ? cfg.speed : 900,
      emitEvery: typeof cfg.emitEvery === "number" ? cfg.emitEvery : 0.35,
    };
  }

  return {
    consumeOutbox() {
      const batch = sonarOutbox.slice();
      sonarOutbox.length = 0;
      return batch;
    },

    getWaves() {
      const { speed, maxRadius } = getConfig();
      return sonarWaves.map((w) => ({
        x: w.x,
        y: w.y,
        radius: w.age * speed,
        maxRadius,
      }));
    },

    onHit({ angle }) {
      if (typeof angle !== "number") return;
      indicators.push({ angle, age: 0, ttl: 0.9, kind: "hit" });
    },

    onConfirm({ angle }) {
      if (typeof angle !== "number") return;
      indicators.push({ angle, age: 0, ttl: 0.6, kind: "confirm" });
    },

    getIndicators() {
      return indicators;
    },

    update({ dt, player, prevX, prevY }) {
      const moved = Math.hypot(player.x - prevX, player.y - prevY);
      const { emitEvery, speed, maxRadius } = getConfig();

      sonarCooldown -= dt;

      if (moved > 0.05 && sonarCooldown <= 0) {
        const ox = player.x + player.size / 2;
        const oy = player.y + player.size / 2;

        sonarWaves.push({ x: ox, y: oy, age: 0 });
        sonarOutbox.push({ x: ox, y: oy });

        sonarCooldown = emitEvery;
      }

      for (let i = sonarWaves.length - 1; i >= 0; i--) {
        const w = sonarWaves[i];
        w.age += dt;
        if (w.age * speed >= maxRadius) sonarWaves.splice(i, 1);
      }

      for (let i = indicators.length - 1; i >= 0; i--) {
        const it = indicators[i];
        it.age += dt;
        if (it.age >= it.ttl) indicators.splice(i, 1);
      }
    },
  };
}
