import { WORLD } from "./world.js";

// Config central do client (defaults).
// Importante: manter compatibilidade com o código atual.
export const CONFIG = {
  // ===== Compat (não remover sem refatorar o jogo)
  // true = mostra adversários / false = adversários invisíveis
  showOtherPlayers: true,

  // ===== Mundo (referência ao WORLD atual)
  world: WORLD,

  // ===== Visual
  visuals: {
    // cor do fundo do canvas
    backgroundColor: "#1A1A1D",

    // cores dos players
    players: {
      myColor: "#D2C1B6",
      otherColor: "#948979",
    },

    // grid do mapa
    grid: {
      enabled: true,
    },

    // overlay (FPS)
    fps: {
      enabled: true,
    },
  },

  // ===== UI
  ui: {
    hud: {
      // true = exibe "(você)" na lista
      showYouLabel: true,
    },
  },
};
