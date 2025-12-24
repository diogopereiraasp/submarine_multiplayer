const magicValue = 1280;

export const WORLD = {
  width: magicValue * 2,
  height: magicValue * 2,

  // área visível (mundo) na horizontal. Mantém mesma “câmera lógica” em qualquer tela.
  viewWidth: magicValue,

  // grid do mapa
  gridSize: magicValue / 10,

  // ✅ SONAR (necessário pro game + renderer)
  sonar: {
    // ✅ distância que o sonar IDENTIFICA outro player (alcance de detecção/colisão no servidor)
    detectRadius: magicValue, //500
    // raio máximo do pulso (unidades do mundo)
    maxRadius: magicValue, //1800
    // velocidade (unidades do mundo por segundo)
    speed: magicValue / 2, //900
    // emite automaticamente enquanto move (intervalo mínimo)
    emitEvery: 0.5, //0.35
  },
};
