export const WORLD = {
  width: 1200,
  height: 1200,

  // área visível (mundo) na horizontal. Mantém mesma “câmera lógica” em qualquer tela.
  viewWidth: 1200,

  // grid do mapa
  gridSize: 100,

  // ✅ SONAR (necessário pro game + renderer)
  sonar: {
    // ✅ distância que o sonar IDENTIFICA outro player (alcance de detecção/colisão no servidor)
    detectRadius: 800, //500
    // raio máximo do pulso (unidades do mundo)
    maxRadius: 800, //1800
    // velocidade (unidades do mundo por segundo)
    speed: 500, //900
    // emite automaticamente enquanto move (intervalo mínimo)
    emitEvery: 0.35, //0.35
  },
};
