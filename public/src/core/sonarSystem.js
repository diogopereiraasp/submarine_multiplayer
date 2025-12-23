/**
 * Sistema de sonar (ondas locais + outbox + indicadores).
 * Contrato:
 * - update(dt, moved, centerX, centerY)
 * - getWaves()
 * - consumeOutbox()
 * - onHit({angle})
 * - onConfirm({angle})
 * - getIndicators()
 */
export function createSonarSystem(world) {
  const sonarWaves = []; // { x, y, age }
  const sonarOutbox = []; // { x, y }
  const sonarIndicators = []; // { angle, age, ttl, kind }
  let cooldown = 0;

  function cfg() {
    const s = world?.sonar ?? {};
    return {
      maxRadius: typeof s.maxRadius === "number" ? s.maxRadius : 1800,
      speed: typeof s.speed === "number" ? s.speed : 900,
      emitEvery: typeof s.emitEvery === "number" ? s.emitEvery : 0.35,
    };
  }

  function update(dt, moved, cx, cy) {
    const { maxRadius, speed, emitEvery } = cfg();

    cooldown -= dt;

    // emite automaticamente enquanto está se movendo
    if (moved > 0.05 && cooldown <= 0) {
      sonarWaves.push({ x: cx, y: cy, age: 0 });
      sonarOutbox.push({ x: cx, y: cy });
      cooldown = emitEvery;
    }

    // ondas: remove ao atingir raio máximo
    for (let i = sonarWaves.length - 1; i >= 0; i--) {
      const w = sonarWaves[i];
      w.age += dt;
      if (w.age * speed >= maxRadius) sonarWaves.splice(i, 1);
    }

    // indicadores: fade rápido
    for (let i = sonarIndicators.length - 1; i >= 0; i--) {
      const it = sonarIndicators[i];
      it.age += dt;
      if (it.age >= it.ttl) sonarIndicators.splice(i, 1);
    }
  }

  function getWaves() {
    const { maxRadius, speed } = cfg();
    return sonarWaves.map((w) => ({
      x: w.x,
      y: w.y,
      radius: w.age * speed,
      maxRadius,
    }));
  }

  function consumeOutbox() {
    const batch = sonarOutbox.slice();
    sonarOutbox.length = 0;
    return batch;
  }

  function onHit({ angle }) {
    if (typeof angle !== "number") return;
    sonarIndicators.push({ angle, age: 0, ttl: 0.9, kind: "hit" });
  }

  function onConfirm({ angle }) {
    if (typeof angle !== "number") return;
    sonarIndicators.push({ angle, age: 0, ttl: 0.6, kind: "confirm" });
  }

  function getIndicators() {
    return sonarIndicators;
  }

  return {
    update,
    getWaves,
    consumeOutbox,
    onHit,
    onConfirm,
    getIndicators,
  };
}
