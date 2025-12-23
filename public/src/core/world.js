export const WORLD = {
  width: 5000,
  height: 5000,

  // área visível (mundo) na horizontal. Mantém mesma “câmera lógica” em qualquer tela.
  viewWidth: 1200,

  // grid do mapa
  gridSize: 100,

  // ✅ SONAR (necessário pro game + renderer)
  sonar: {
    // raio máximo do pulso (unidades do mundo)
    maxRadius: 1800,
    // velocidade (unidades do mundo por segundo)
    speed: 900,
    // emite automaticamente enquanto move (intervalo mínimo)
    emitEvery: 0.35,
  },
};
