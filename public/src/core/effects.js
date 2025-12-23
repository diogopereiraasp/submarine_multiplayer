/**
 * Efeitos locais (click feedback).
 * Contrato:
 * - add(x,y)
 * - update(dt)
 * - list()
 */
export function createEffects() {
  const clickEffects = [];

  function add(x, y) {
    clickEffects.push({
      x,
      y,
      age: 0,
      ttl: 0.35,
      radius: 14,
    });
  }

  function update(dt) {
    for (let i = clickEffects.length - 1; i >= 0; i--) {
      const fx = clickEffects[i];
      fx.age += dt;
      if (fx.age >= fx.ttl) clickEffects.splice(i, 1);
    }
  }

  function list() {
    return clickEffects;
  }

  return { add, update, list };
}
