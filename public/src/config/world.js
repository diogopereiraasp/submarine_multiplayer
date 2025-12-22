export const WORLD = {
  width: 5000,
  height: 5000,

  // Área de mundo visível na horizontal (em unidades do mundo).
  // Mantém a "mesma câmera" em qualquer monitor: telas maiores só têm mais pixels.
  viewWidth: 1200,

  // Tamanho da malha (em unidades do mundo). Fácil de ajustar.
  // (Na prática, 1 unidade do mundo == 1px quando scale=1)
  gridSize: 100,
};
