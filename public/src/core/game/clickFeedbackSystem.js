export function createClickFeedbackSystem() {
  const effects = []; // { x, y, age, ttl, radius }

  return {
    add(x, y) {
      effects.push({
        x,
        y,
        age: 0,
        ttl: 0.35,
        radius: 14,
      });
    },

    get() {
      return effects;
    },

    update(dt) {
      for (let i = effects.length - 1; i >= 0; i--) {
        const fx = effects[i];
        fx.age += dt;
        if (fx.age >= fx.ttl) effects.splice(i, 1);
      }
    },
  };
}
